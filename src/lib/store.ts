/**
 * Everything you do on the site (progress, your code, settings) is kept as small
 * records in the browser. Each record has a time stamp, so two devices can tell
 * which copy is newer when they sync.
 */
import { useSyncExternalStore } from "react";

export interface Rec {
  /** The value. */
  v: unknown;
  /** When it was last changed (milliseconds). */
  t: number;
  /** 1 when the record was deleted. Kept so the deletion can sync. */
  d?: 1;
}

const PREFIX = "tc.r:";
const DIRTY_KEY = "tc.dirty";

const cache = new Map<string, Rec>();
const dirty = new Set<string>();
const listeners = new Set<() => void>();
const dirtyListeners = new Set<() => void>();
let version = 0;
let loaded = false;
let storageWorks = true;

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    storageWorks = false;
    return null;
  }
};

const write = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    storageWorks = false;
  }
};

const load = () => {
  if (loaded) return;
  loaded = true;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(PREFIX)) continue;
      try {
        const rec = JSON.parse(localStorage.getItem(k) ?? "") as Rec;
        if (rec && typeof rec.t === "number") cache.set(k.slice(PREFIX.length), rec);
      } catch {
        /* skip a damaged record */
      }
    }
    for (const k of JSON.parse(read(DIRTY_KEY) ?? "[]") as string[]) dirty.add(k);
  } catch {
    storageWorks = false;
  }
  if (typeof window !== "undefined") {
    // Another tab of this site changed something.
    window.addEventListener("storage", (event) => {
      if (!event.key) return;
      if (event.key === DIRTY_KEY) {
        dirty.clear();
        try {
          for (const k of JSON.parse(event.newValue ?? "[]") as string[]) dirty.add(k);
        } catch {
          /* ignore */
        }
        return;
      }
      if (!event.key.startsWith(PREFIX)) return;
      const key = event.key.slice(PREFIX.length);
      try {
        if (event.newValue === null) cache.delete(key);
        else cache.set(key, JSON.parse(event.newValue) as Rec);
      } catch {
        return;
      }
      emit();
    });
  }
};

const emit = () => {
  version++;
  for (const fn of listeners) fn();
};

const saveDirty = () => {
  write(DIRTY_KEY, JSON.stringify([...dirty]));
  for (const fn of dirtyListeners) fn();
};

export const store = {
  get<T>(key: string): T | undefined {
    load();
    const rec = cache.get(key);
    return rec && !rec.d ? (rec.v as T) : undefined;
  },

  rec(key: string): Rec | undefined {
    load();
    return cache.get(key);
  },

  set(key: string, value: unknown) {
    load();
    // Always later than the copy we replace, even if this device's clock is behind.
    const previous = cache.get(key);
    const rec: Rec = { v: value, t: Math.max(Date.now(), (previous?.t ?? 0) + 1) };
    cache.set(key, rec);
    write(PREFIX + key, JSON.stringify(rec));
    dirty.add(key);
    saveDirty();
    emit();
  },

  remove(key: string) {
    load();
    const previous = cache.get(key);
    if (!previous || previous.d) return;
    const rec: Rec = { v: null, t: Math.max(Date.now(), previous.t + 1), d: 1 };
    cache.set(key, rec);
    write(PREFIX + key, JSON.stringify(rec));
    dirty.add(key);
    saveDirty();
    emit();
  },

  /** Live records whose key starts with `prefix`. */
  entries<T>(prefix: string): [string, T, number][] {
    load();
    const out: [string, T, number][] = [];
    for (const [key, rec] of cache) if (key.startsWith(prefix) && !rec.d) out.push([key, rec.v as T, rec.t]);
    return out;
  },

  /** A record that arrived from another device. Newer wins. */
  applyRemote(key: string, rec: Rec): boolean {
    load();
    const local = cache.get(key);
    if (local && local.t >= rec.t) return false;
    cache.set(key, rec);
    write(PREFIX + key, JSON.stringify(rec));
    if (dirty.delete(key)) saveDirty();
    return true;
  },

  notify: emit,

  dirtyKeys(): string[] {
    load();
    return [...dirty];
  },

  /** Called after a push: a record stays dirty if it changed again meanwhile. */
  markSynced(pushed: { key: string; t: number }[]) {
    let changed = false;
    for (const { key, t } of pushed) {
      const rec = cache.get(key);
      if (rec && rec.t === t && dirty.delete(key)) changed = true;
    }
    if (changed) saveDirty();
  },

  markAllDirty() {
    load();
    for (const key of cache.keys()) dirty.add(key);
    saveDirty();
  },

  exportAll(): Record<string, Rec> {
    load();
    return Object.fromEntries(cache);
  },

  /** Merges a backup: for each record the newer copy wins. Returns how many were taken. */
  importAll(data: Record<string, Rec>): number {
    load();
    let taken = 0;
    for (const [key, rec] of Object.entries(data)) {
      if (!rec || typeof rec.t !== "number") continue;
      const local = cache.get(key);
      if (local && local.t >= rec.t) continue;
      cache.set(key, rec);
      write(PREFIX + key, JSON.stringify(rec));
      dirty.add(key);
      taken++;
    }
    saveDirty();
    emit();
    return taken;
  },

  /** Forgets everything on this device. Does not touch other devices. */
  clearDevice() {
    load();
    for (const key of cache.keys()) write(PREFIX + key, null);
    cache.clear();
    dirty.clear();
    saveDirty();
    emit();
  },

  storageWorks: () => storageWorks,

  subscribe(fn: () => void) {
    load();
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  subscribeDirty(fn: () => void) {
    dirtyListeners.add(fn);
    return () => dirtyListeners.delete(fn);
  },

  version: () => version,
};

/** Re-renders when any record changes. Use the returned number as a dependency. */
export function useStoreVersion(): number {
  return useSyncExternalStore(store.subscribe, store.version);
}

export function useRecord<T>(key: string): T | undefined {
  useStoreVersion();
  return store.get<T>(key);
}

// -------------------------------------------------------------- typed access

export type LessonState = "done" | "skipped" | "started";

export interface LessonRecord {
  s: LessonState;
  at: number;
  /** Lessons on your computer: the numbers of the things you ticked under "Check yourself". */
  ticks?: number[];
}

export interface CodeRecord {
  files: Record<string, string>;
}

export interface ProjectRecord {
  s: "done" | "started";
  /** Which steps are ticked. */
  steps: number[];
  /** Where you published it, if you did. */
  url?: string;
  at: number;
}

export interface Prefs {
  /** The paper look of TururuCoding itself. */
  theme: "auto" | "light" | "dark";
  /** A VS Code theme from the list, or "tururu" for the site's own blueprint. */
  codeTheme: string;
  /** Does the VS Code theme color the pages too, or only the code areas? */
  themeWholeSite: boolean;
  /** Keep twist answers folded until you click them. */
  foldTwist: boolean;
}

export const defaultPrefs: Prefs = { theme: "auto", codeTheme: "tururu", themeWholeSite: true, foldTwist: false };

export const getPrefs = (): Prefs => ({ ...defaultPrefs, ...(store.get<Partial<Prefs>>("prefs") ?? {}) });
export const setPrefs = (patch: Partial<Prefs>) => store.set("prefs", { ...getPrefs(), ...patch });

export const lessonState = (id: string): LessonState | undefined => store.get<LessonRecord>(`lesson:${id}`)?.s;

export const setLessonState = (id: string, s: LessonState | null) => {
  if (s === null) store.remove(`lesson:${id}`);
  else {
    const ticks = store.get<LessonRecord>(`lesson:${id}`)?.ticks;
    store.set(`lesson:${id}`, { s, at: Date.now(), ...(ticks?.length ? { ticks } : {}) } satisfies LessonRecord);
  }
};

export const lessonTicks = (id: string): number[] => store.get<LessonRecord>(`lesson:${id}`)?.ticks ?? [];

/** Ticks or unticks one thing under "Check yourself". */
export const toggleLessonTick = (id: string, index: number) => {
  const record = store.get<LessonRecord>(`lesson:${id}`);
  const before = record?.ticks ?? [];
  const ticks = before.includes(index) ? before.filter((n) => n !== index) : [...before, index].sort((a, b) => a - b);
  store.set(`lesson:${id}`, { s: record?.s ?? "started", at: Date.now(), ticks } satisfies LessonRecord);
};

/** "started" never replaces "done" or "skipped". */
export const touchLesson = (id: string) => {
  if (!lessonState(id)) setLessonState(id, "started");
};

export const savedCode = (id: string): Record<string, string> | undefined => store.get<CodeRecord>(`code:${id}`)?.files;
export const saveCode = (id: string, files: Record<string, string>) => store.set(`code:${id}`, { files } satisfies CodeRecord);
