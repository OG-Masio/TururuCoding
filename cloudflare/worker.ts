/**
 * TururuCoding on Cloudflare.
 *
 * One Worker does two things:
 *  1. Serves the built site (../dist) as static files. Those requests never run
 *     this code.
 *  2. Syncs your progress and your code between your devices under /api/sync.
 *     A Durable Object with a small SQLite database holds the records.
 *
 * Every /api route except /api/info requires "Authorization: Bearer <device key>".
 * The server only knows a SHA-256 hash of that key (SYNC_KEY_HASH), never the
 * key itself.
 */
import { DurableObject } from "cloudflare:workers";

export interface Env {
  ASSETS: Fetcher;
  STORE: DurableObjectNamespace<SyncStore>;
  SYNC_KEY_HASH?: string;
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

// ------------------------------------------------------------------ routes

async function handleApi(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;

  // Public: lets the site recognise a TururuCoding server.
  if (path === "/api/info") {
    return json({ app: "tururucoding", api: 1, configured: !!env.SYNC_KEY_HASH });
  }

  if (!env.SYNC_KEY_HASH) return fail(503, "This server has no device key yet. Run the Cloudflare setup again.");
  if (!(await isAuthorized(request, env))) return fail(401, "The device key was not accepted.");

  if (path === "/api/auth") return new Response(null, { status: 204 });

  if (path === "/api/stats" && request.method === "GET") {
    return json(await storeStub(env).stats());
  }

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
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    try {
      return withCors(await handleApi(request, env, url));
    } catch (error) {
      console.error(error);
      return withCors(fail(500, error instanceof Error ? error.message : "Server error."));
    }
  },
} satisfies ExportedHandler<Env>;
