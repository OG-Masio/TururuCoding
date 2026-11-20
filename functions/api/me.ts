import { currentUser, json, type Env } from '../_lib';
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  return json({ user: u && { name: u.name, email: u.email, picture: u.picture } });
};
