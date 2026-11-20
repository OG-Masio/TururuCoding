import { currentUser, json, type Env } from '../_lib';

type Row = { lesson_id: string; completed: number; files_json: string | null; updated_at: number };

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u) return json({ error: 'Not logged in' }, { status: 401 });
  const { results } = await env.DB.prepare(
    'SELECT lesson_id, completed, files_json, updated_at FROM progress WHERE user_id = ?',
  ).bind(u.id).all<Row>();
  const out: Record<string, unknown> = {};
  for (const r of results) {
    out[r.lesson_id] = { completed: !!r.completed, files: r.files_json ? JSON.parse(r.files_json) : undefined, updatedAt: r.updated_at };
  }
  return json(out);
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u) return json({ error: 'Not logged in' }, { status: 401 });
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ error: 'Bad request' }, { status: 400 });
  const text = await request.text();
  if (text.length > 300_000) return json({ error: 'Too large' }, { status: 413 });
  const b = JSON.parse(text) as { lessonId?: string; completed?: boolean; files?: unknown; updatedAt?: number };
  if (!b.lessonId || !/^[\w-]+\/[\w-]+$/.test(b.lessonId)) return json({ error: 'Bad lesson id' }, { status: 400 });
  const updatedAt = Math.min(Number(b.updatedAt) || Date.now(), Date.now() + 60_000);
  await env.DB.prepare(
    `INSERT INTO progress (user_id, lesson_id, completed, files_json, updated_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed = excluded.completed, files_json = excluded.files_json, updated_at = excluded.updated_at
     WHERE excluded.updated_at >= progress.updated_at`,
  ).bind(u.id, b.lessonId, b.completed ? 1 : 0, b.files ? JSON.stringify(b.files) : null, updatedAt).run();
  return json({ ok: true });
};
