/**
 * TururuCoding on Cloudflare.
 *
 * One Worker does three things:
 *  1. Serves the built site (../dist) as static files. Those requests never run
 *     this code.
 *  2. Syncs your progress and your code between your devices under /api/sync.
 *     A Durable Object with a small SQLite database holds the records.
 *  3. Answers questions about a lesson under /api/tutor, with an AI model that
 *     runs in this same Cloudflare account (Workers AI). See tutor.ts.
 *
 * Every /api route except /api/info requires "Authorization: Bearer <device key>".
 * The server only knows a SHA-256 hash of that key (SYNC_KEY_HASH), never the
 * key itself.
 */
import { DurableObject } from "cloudflare:workers";
import { DAILY_NEURONS, LIMITS, MODELS, askModel, buildMessages, costOf, describeAiError, measureStream, modelFor, questionsLeft, readTutorRequest, reserveFor, statusFor, utcDay, type AiBinding } from "./tutor";

export interface Env {
  ASSETS: Fetcher;
  STORE: DurableObjectNamespace<SyncStore>;
  SYNC_KEY_HASH?: string;
  /** Workers AI. Missing on a server that was published before the tutor existed. */
  AI?: AiBinding;
}

const MAX_BODY_BYTES = 1024 * 1024; // one push
const MAX_VALUE_BYTES = 400 * 1024; // one record
const MAX_RECORDS_PER_PUSH = 100;
const PAGE_ROWS = 200;
const PAGE_BYTES = 800 * 1024;
const KEY_PATTERN = /^[A-Za-z0-9:_.-]{1,160}$/;

interface IncomingRecord {
  key: string;
  updatedAt: number;
  deleted?: boolean;
  value?: string | null;
}

interface Row {
  key: string;
  updatedAt: number;
  deleted: number;
  value: string | null;
  seq: number;
}

/** All records of the one user of this site. Calls run one at a time. */
export class SyncStore extends DurableObject<Env> {
  private sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS records (
      key TEXT PRIMARY KEY,
      updated_at INTEGER NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      value TEXT,
      seq INTEGER NOT NULL
    )`);
    this.sql.exec("CREATE INDEX IF NOT EXISTS records_seq ON records (seq)");
    // What the tutor used on each day (UTC), in neurons. See DAILY_NEURONS in tutor.ts.
    this.sql.exec("CREATE TABLE IF NOT EXISTS tutor_days (day TEXT PRIMARY KEY, used INTEGER NOT NULL)");
  }

  /** The neurons the tutor used on this day. */
  tutorUsed(day: string): number {
    const row = this.sql.exec("SELECT used FROM tutor_days WHERE day = ?", day).toArray()[0] as { used: number } | undefined;
    return row?.used ?? 0;
  }

  /** Sets neurons aside for one question, unless they do not fit in today's budget. Calls run one at a time, so two devices cannot both take the last room. */
  spendTutor(day: string, amount: number, budget: number): { ok: boolean; used: number } {
    this.sql.exec("DELETE FROM tutor_days WHERE day < ?", day);
    const used = this.tutorUsed(day);
    if (used + amount > budget) return { ok: false, used };
    this.sql.exec("INSERT INTO tutor_days (day, used) VALUES (?, ?) ON CONFLICT (day) DO UPDATE SET used = used + ?", day, amount, amount);
    return { ok: true, used: used + amount };
  }

  /** Corrects today's count: gives back what a question did not use, or adds what it used on top. */
  adjustTutor(day: string, change: number): void {
    this.sql.exec("UPDATE tutor_days SET used = MAX(used + ?, 0) WHERE day = ?", Math.round(change), day);
  }

  /** Records changed after change number `after`, oldest first. */
  changes(after: number): { rows: Row[]; more: boolean } {
    const all = this.sql
      .exec("SELECT key, updated_at AS updatedAt, deleted, value, seq FROM records WHERE seq > ? ORDER BY seq LIMIT ?", after, PAGE_ROWS + 1)
      .toArray() as unknown as Row[];
    const rows: Row[] = [];
    let bytes = 0;
    for (const row of all.slice(0, PAGE_ROWS)) {
      bytes += row.value?.length ?? 0;
      if (rows.length && bytes > PAGE_BYTES) break;
      rows.push(row);
    }
    return { rows, more: rows.length < all.length };
  }

  /** Last write wins: a record that is not newer than the stored one is refused. */
  push(records: IncomingRecord[]): { accepted: boolean[]; seq: number } {
    let seq = (this.sql.exec("SELECT COALESCE(MAX(seq), 0) AS n FROM records").one().n as number) ?? 0;
    const accepted = records.map((record) => {
      const current = this.sql.exec("SELECT updated_at FROM records WHERE key = ?", record.key).toArray()[0] as { updated_at: number } | undefined;
      if (current && current.updated_at >= record.updatedAt) return false;
      seq += 1;
      this.sql.exec(
        `INSERT INTO records (key, updated_at, deleted, value, seq) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (key) DO UPDATE SET updated_at = excluded.updated_at, deleted = excluded.deleted,
           value = excluded.value, seq = excluded.seq`,
        record.key,
        record.updatedAt,
        record.deleted ? 1 : 0,
        record.deleted ? null : (record.value ?? null),
        seq,
      );
      return true;
    });
    return { accepted, seq };
  }

  stats() {
    const row = this.sql
      .exec("SELECT COUNT(*) AS records, COALESCE(SUM(LENGTH(value)), 0) AS bytes, COALESCE(MAX(seq), 0) AS seq FROM records WHERE deleted = 0")
      .one();
    return { records: row.records as number, bytes: row.bytes as number, seq: row.seq as number };
  }
}

// ----------------------------------------------------------------- helpers

const CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-expose-headers": "x-tutor-used, x-tutor-limit, x-tutor-model, x-tutor-answered",
  "access-control-max-age": "86400",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

const fail = (status: number, message: string) => json({ error: message }, status);

const withCors = (res: Response) => {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(CORS)) out.headers.set(k, v);
  return out;
};

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

const isAuthorized = async (request: Request, env: Env) => {
  const expected = (env.SYNC_KEY_HASH ?? "").trim().toLowerCase();
  const header = request.headers.get("authorization") ?? "";
  const key = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!expected || !key) return false;
  const actual = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key)));
  const a = new TextEncoder().encode(actual);
  const b = new TextEncoder().encode(expected);
  return a.byteLength === b.byteLength && crypto.subtle.timingSafeEqual(a, b);
};

const storeStub = (env: Env) => env.STORE.get(env.STORE.idFromName("workspace"));

/** Checks a pushed record. Returns a message when something is wrong. */
const problemWith = (record: unknown): string | null => {
  if (!record || typeof record !== "object") return "A record is not an object.";
  const r = record as Record<string, unknown>;
  if (typeof r.key !== "string" || !KEY_PATTERN.test(r.key)) return "A record has a bad key.";
  if (typeof r.updatedAt !== "number" || !Number.isSafeInteger(r.updatedAt) || r.updatedAt <= 0) return "A record has a bad time stamp.";
  if (r.deleted) return null;
  if (typeof r.value !== "string") return "A record has no value.";
  if (r.value.length > MAX_VALUE_BYTES) return `"${r.key}" is too large to sync.`;
  return null;
};

// ------------------------------------------------------------------- tutor

/**
 * What a page that was loaded before version 1.7 still asks for: a count of questions.
 * It reads "limit minus used" as the questions left.
 */
const oldCount = (spent: number) => ({ used: 0, limit: questionsLeft(MODELS[0], DAILY_NEURONS - spent) });

/** POST /api/tutor: one question in, the model's answer out, as a stream. */
async function handleTutor(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!env.AI) return fail(503, "This server has no tutor yet. Publish the site again to add it.");

  const length = Number(request.headers.get("content-length") ?? "NaN");
  if (Number.isFinite(length) && length > LIMITS.body) return fail(413, "The question is too large.");
  const raw = await request.text();
  if (raw.length > LIMITS.body) return fail(413, "The question is too large.");
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, "The request is not valid JSON.");
  }
  const asked = readTutorRequest(body);
  if (!asked.ok) return fail(400, asked.error);

  const chosen = modelFor(asked.value.model);
  const messages = buildMessages(asked.value);

  // Set the most this question can cost aside before the model runs. This is what keeps the tutor inside the free amount.
  const day = utcDay();
  const store = storeStub(env);
  const reserved = reserveFor(chosen, messages);
  const turn = await store.spendTutor(day, reserved, DAILY_NEURONS);
  if (!turn.ok) {
    // A smaller model costs less: it may still fit.
    const smaller = MODELS.find((model) => model !== chosen && reserveFor(model, messages) <= DAILY_NEURONS - turn.used);
    const tip = smaller ? ` ${smaller.name} is cheaper and still has room: choose it at the top of the tutor.` : "";
    return json({ error: `The tutor has used its free AI amount for today. It starts again at midnight UTC.${tip}`, ...statusFor(turn.used), ...oldCount(turn.used) }, 429);
  }

  try {
    const { stream, model } = await askModel(env.AI, messages, chosen);
    // One copy of the answer goes to the browser. The other is read here, to count what the answer really cost.
    const [toBrowser, toCount] = stream.tee();
    ctx.waitUntil(
      measureStream(toCount)
        .then((measured) => store.adjustTutor(day, costOf(model, messages, measured) - reserved))
        .catch((error) => console.error("tutor count", error)),
    );
    const old = oldCount(turn.used);
    return new Response(toBrowser, {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-store",
        // Which model answered: its full name for Workers AI, and its short name. It is not always the chosen one.
        "x-tutor-model": model.id,
        "x-tutor-answered": model.key,
        "x-tutor-used": String(old.used),
        "x-tutor-limit": String(old.limit),
      },
    });
  } catch (error) {
    console.error("tutor", error);
    await store.adjustTutor(day, -reserved);
    const problem = describeAiError(error);
    return fail(problem.status, problem.message);
  }
}

// ------------------------------------------------------------------ routes

async function handleApi(request: Request, env: Env, url: URL, ctx: ExecutionContext): Promise<Response> {
  const path = url.pathname;

  // Public: lets the site recognise a TururuCoding server.
  if (path === "/api/info") {
    return json({ app: "tururucoding", api: 2, configured: !!env.SYNC_KEY_HASH, tutor: !!env.AI });
  }

  if (!env.SYNC_KEY_HASH) return fail(503, "This server has no device key yet. Run the Cloudflare setup again.");
  if (!(await isAuthorized(request, env))) return fail(401, "The device key was not accepted.");

  if (path === "/api/auth") return new Response(null, { status: 204 });

  if (path === "/api/stats" && request.method === "GET") {
    return json(await storeStub(env).stats());
  }

  // The models of the tutor, and about how many questions are left today with each.
  if (path === "/api/tutor" && request.method === "GET") {
    const spent = await storeStub(env).tutorUsed(utcDay());
    return json({ on: !!env.AI, ...statusFor(spent), ...oldCount(spent) });
  }

  if (path === "/api/tutor" && request.method === "POST") return handleTutor(request, env, ctx);

  if (path === "/api/sync/changes" && request.method === "GET") {
    const after = Math.max(0, Math.floor(Number(url.searchParams.get("after") ?? 0)) || 0);
    return json(await storeStub(env).changes(after));
  }

  if (path === "/api/sync/push" && request.method === "POST") {
    const length = Number(request.headers.get("content-length") ?? "NaN");
    if (Number.isFinite(length) && length > MAX_BODY_BYTES) return fail(413, "Too much data in one request.");
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return fail(413, "Too much data in one request.");
    let body: { records?: unknown };
    try {
      body = JSON.parse(text) as { records?: unknown };
    } catch {
      return fail(400, "The request is not valid JSON.");
    }
    if (!Array.isArray(body.records)) return fail(400, "The request has no records.");
    if (body.records.length > MAX_RECORDS_PER_PUSH) return fail(413, "Too many records in one request.");
    for (const record of body.records) {
      const problem = problemWith(record);
      if (problem) return fail(400, problem);
    }
    const records = (body.records as IncomingRecord[]).map((r) => ({
      key: r.key,
      updatedAt: r.updatedAt,
      deleted: !!r.deleted,
      value: r.deleted ? null : (r.value ?? null),
    }));
    return json(await storeStub(env).push(records));
  }

  return fail(404, "Unknown endpoint.");
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    try {
      return withCors(await handleApi(request, env, url, ctx));
    } catch (error) {
      console.error(error);
      return withCors(fail(500, error instanceof Error ? error.message : "Server error."));
    }
  },
} satisfies ExportedHandler<Env>;
