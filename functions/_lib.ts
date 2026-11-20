export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID?: string;
  ALLOWED_EMAILS?: string; // optional, comma separated. Empty = anyone with a Google account.
}

export const COOKIE = 'tururu_session';
export const SESSION_DAYS = 90;

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...(init.headers ?? {}) },
  });
}

export function readCookie(req: Request, name: string) {
  const h = req.headers.get('cookie') ?? '';
  for (const part of h.split(/;\s*/)) {
    const i = part.indexOf('=');
    if (part.slice(0, i) === name) return decodeURIComponent(part.slice(i + 1));
  }
  return null;
}

export type SessionUser = { id: string; name: string; email: string; picture: string | null };

export async function currentUser(req: Request, env: Env): Promise<SessionUser | null> {
  const token = readCookie(req, COOKIE);
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT u.id, u.name, u.email, u.picture FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > ?`,
  ).bind(token, Date.now()).first<SessionUser>();
  return row ?? null;
}

export function randomToken() {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// The tables are created automatically the first time the API is used,
// so setting up the database needs no manual step. (Same SQL as migrations/0001_init.sql.)
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, google_sub TEXT NOT NULL UNIQUE, email TEXT NOT NULL, name TEXT NOT NULL, picture TEXT, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS progress (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, lesson_id TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, files_json TEXT, updated_at INTEGER NOT NULL, PRIMARY KEY (user_id, lesson_id))`,
];
let schemaReady: Promise<unknown> | null = null;
export function ensureSchema(env: Env) {
  schemaReady ??= env.DB.batch(SCHEMA.map((sql) => env.DB.prepare(sql))).catch((e) => {
    schemaReady = null;
    throw e;
  });
  return schemaReady;
}
