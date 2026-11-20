import { COOKIE, json, readCookie, type Env } from '../../_lib';
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const token = readCookie(request, COOKIE);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  return json({ ok: true }, { headers: { 'set-cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` } });
};
