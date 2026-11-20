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
const subs = new Set<() => void>();
function set(u: User | null) {
  current = u;
  subs.forEach((s) => s());
}

export async function initAuth() {
  try {
    const cfg = await fetch('/api/config');
    if (cfg.ok) clientId = ((await cfg.json()) as { googleClientId?: string }).googleClientId || null;
    const me = await fetch('/api/me');
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
  set(current); // re-render, so the sign-in button appears once we know it's available
}

export function useAuth() {
  const [, rerender] = useState(0);
  useEffect(() => {
    const sub = () => rerender((n) => n + 1);
    subs.add(sub);
    return () => void subs.delete(sub);
  }, []);
  return { user: current, loginAvailable: !!clientId };
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
