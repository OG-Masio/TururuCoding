import { json, type Env } from '../_lib';
export const onRequestGet: PagesFunction<Env> = ({ env }) => json({ googleClientId: env.GOOGLE_CLIENT_ID ?? null });
