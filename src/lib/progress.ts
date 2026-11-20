// Progress lives in localStorage right away, and syncs to the server when logged in.
import { useSyncExternalStore } from 'react';
import type { LessonFile } from './lessons';

export type LessonProgress = { completed: boolean; files?: LessonFile[]; updatedAt: number };
type State = Record<string, LessonProgress>;

const KEY = 'tururu.progress.v1';
let state: State = load();
const listeners = new Set<() => void>();
let loggedIn = false;
const pending = new Map<string, ReturnType<typeof setTimeout>>();

function load(): State {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage may be blocked; progress still works for this visit */
  }
  listeners.forEach((l) => l());
}

export function useProgress(): State {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
  );
}

export function getLesson(id: string): LessonProgress | undefined {
  return state[id];
}

function update(id: string, patch: Partial<LessonProgress>, delay: number) {
  state = { ...state, [id]: { ...{ completed: false }, ...state[id], ...patch, updatedAt: Date.now() } };
  save();
  if (!loggedIn) return;
  clearTimeout(pending.get(id));
  pending.set(id, setTimeout(() => push(id), delay));
}

export function saveCode(id: string, files: LessonFile[]) {
  update(id, { files }, 1500);
}
export function setCompleted(id: string, completed: boolean) {
  update(id, { completed }, 0);
}

async function push(id: string) {
  pending.delete(id);
  const p = state[id];
  if (!p) return;
  try {
    await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lessonId: id, ...p }),
    });
  } catch {
    /* offline: it will be pushed again on the next login merge */
  }
}

// After login: newest copy of each lesson wins, then anything newer locally goes up.
export async function syncWithServer() {
  loggedIn = true;
  const res = await fetch('/api/progress');
  if (!res.ok) return;
  const server = (await res.json()) as State;
  const merged: State = { ...state };
  const toPush: string[] = [];
  for (const [id, p] of Object.entries(server)) {
    if (!merged[id] || merged[id].updatedAt < p.updatedAt) merged[id] = p;
  }
  for (const [id, p] of Object.entries(state)) {
    if (!server[id] || server[id].updatedAt < p.updatedAt) toPush.push(id);
  }
  state = merged;
  save();
  await Promise.all(toPush.map(push));
}

export function onLoggedOut() {
  loggedIn = false;
}
