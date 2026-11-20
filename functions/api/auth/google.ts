import { createRemoteJWKSet, jwtVerify } from 'jose';
import { COOKIE, SESSION_DAYS, isAllowedEmail, json, randomToken, type Env } from '../../_lib';

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

// The browser sends Google's signed ID token; we check it, then start a session.
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.GOOGLE_CLIENT_ID) return json({ error: 'Google login is not set up' }, { status: 503 });
  const { credential } = (await request.json().catch(() => ({}))) as { credential?: string };
  if (!credential) return json({ error: 'Missing credential' }, { status: 400 });

  let p: Record<string, unknown>;
  try {
    ({ payload: p } = await jwtVerify(credential, JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: env.GOOGLE_CLIENT_ID,
    }));
  } catch {
    return json({ error: 'Invalid Google sign-in' }, { status: 401 });
  }
  const email = String(p.email ?? '').toLowerCase();
  if (!p.email_verified || !email) return json({ error: 'Email not verified' }, { status: 401 });
  if (!(await isAllowedEmail(env, email))) return json({ error: 'This Google account is not allowed to sign in here.' }, { status: 403 });

  const sub = String(p.sub);
  const name = String(p.name ?? email);
  const picture = p.picture ? String(p.picture) : null;
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO users (id, google_sub, email, name, picture, created_at) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(google_sub) DO UPDATE SET email = excluded.email, name = excluded.name, picture = excluded.picture`,
  ).bind(crypto.randomUUID(), sub, email, name, picture, now).run();
  const user = await env.DB.prepare('SELECT id FROM users WHERE google_sub = ?').bind(sub).first<{ id: string }>();

  const token = randomToken();
  const maxAge = SESSION_DAYS * 86400;
  await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, user!.id, now + maxAge * 1000).run();
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now).run();

  return json(
    { user: { name, email, picture } },
    { headers: { 'set-cookie': `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}` } },
  );
};
