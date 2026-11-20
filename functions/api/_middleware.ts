import { ensureSchema, json, type Env } from '../_lib';

export const onRequest: PagesFunction<Env> = async ({ env, next }) => {
  if (!env.DB) return json({ error: 'Database is not connected' }, { status: 503 });
  await ensureSchema(env);
  return next();
};
