import { useEffect, useState } from 'react';
import { onLoggedOut, syncWithServer } from './progress';

export type User = { name: string; email: string; picture?: string };

declare global {
  interface Window {
    google?: any;
  }
}

let current: User | null = null;
let clientId: string | null = null;
const subs = new Set<(u: User | null) => void>();
function set(u: User | null) {
  current = u;
  subs.forEach((s) => s(u));
}

export async function initAuth() {
  try {
    const [me, cfg] = await Promise.all([fetch('/api/me'), fetch('/api/config')]);
    if (cfg.ok) clientId = ((await cfg.json()) as { googleClientId?: string }).googleClientId ?? null;
    if (me.ok) {
      const data = (await me.json()) as { user: User | null };
      if (data.user) {
        set(data.user);
        await syncWithServer();
      }
    }
  } catch {
    /* no server running (for example plain "npm run dev"): local progress only */
  }
}

export function useAuth() {
  const [u, setU] = useState(current);
  useEffect(() => {
    subs.add(setU);
    return () => void subs.delete(setU);
  }, []);
  return { user: u, loginAvailable: !!clientId };
}

function loadGsi(): Promise<void> {
  if (window.google?.accounts) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export async function renderGoogleButton(el: HTMLElement) {
  if (!clientId) return;
  await loadGsi();
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: async (resp: { credential: string }) => {
      const r = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ credential: resp.credential }),
      });
      if (r.ok) {
        set(((await r.json()) as { user: User }).user);
        await syncWithServer();
      }
    },
  });
  window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'medium', shape: 'pill' });
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  onLoggedOut();
  window.google?.accounts?.id?.disableAutoSelect?.();
  set(null);
}
