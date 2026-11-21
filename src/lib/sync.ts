/**
 * Keeps your devices in step.
 *
 * A device is linked by opening the device link once (address + "#tc-key=…").
 * The key stays in this browser. Every request to the server carries it, and
 * the server only knows a hash of it.
 *
 * Without a key the site still works: everything stays on this device.
 */
import { useSyncExternalStore } from "react";
import { store, type Rec } from "./store";

const CONFIG_KEY = "tc.sync";

interface SyncConfig {
  key: string;
  /** Empty means "this site". Set when you run the site locally but sync with the published one. */
  server: string;
  /** The last change number we have seen from the server. */
  seq: number;
}

export type SyncPhase = "off" | "idle" | "syncing" | "offline" | "error";

export interface SyncStatus {
  phase: SyncPhase;
  linked: boolean;
  server: string;
  lastSyncedAt: number | null;
  error: string | null;
  /** Records waiting to be sent. */
  pending: number;
}

let config: SyncConfig | null = null;
let configLoaded = false;
let status: SyncStatus = { phase: "off", linked: false, server: "", lastSyncedAt: null, error: null, pending: 0 };
const listeners = new Set<() => void>();
let running: Promise<void> | null = null;
let again = false;
let timer: ReturnType<typeof setTimeout> | null = null;

const setStatus = (patch: Partial<SyncStatus>) => {
  status = { ...status, ...patch };
  for (const fn of listeners) fn();
};

const loadConfig = (): SyncConfig | null => {
  if (configLoaded) return config;
  configLoaded = true;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SyncConfig>;
      if (parsed.key) config = { key: parsed.key, server: parsed.server ?? "", seq: parsed.seq ?? 0 };
    }
  } catch {
    config = null;
  }
  status = { ...status, phase: config ? "idle" : "off", linked: !!config, server: config?.server ?? "", pending: store.dirtyKeys().length };
  return config;
};

const saveConfig = () => {
  try {
    if (config) localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    else localStorage.removeItem(CONFIG_KEY);
  } catch {
    /* private mode: the link lasts until the tab closes */
  }
};

const api = (path: string, server = config?.server ?? "") => `${server.replace(/\/+$/, "")}/api${path}`;

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const request = async (path: string, init: RequestInit = {}, key = config?.key ?? "", server = config?.server ?? "") => {
  const res = await fetch(api(path, server), {
    ...init,
    headers: { ...(init.headers ?? {}), authorization: `Bearer ${key}`, ...(init.body ? { "content-type": "application/json" } : {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `The server answered ${res.status}.`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* not JSON */
    }
    throw new HttpError(res.status, message);
  }
  return res;
};

interface RemoteRow {
  key: string;
  updatedAt: number;
  deleted: number;
  value: string | null;
  seq: number;
}

const MAX_BATCH_RECORDS = 40;
const MAX_BATCH_BYTES = 600_000;

async function push() {
  const keys = store.dirtyKeys();
  let batch: { key: string; updatedAt: number; deleted: boolean; value: string | null }[] = [];
  let bytes = 0;
  const flush = async () => {
    if (!batch.length) return;
    const sent = batch;
    batch = [];
    bytes = 0;
    await request("/sync/push", { method: "POST", body: JSON.stringify({ records: sent }) });
    // Accepted or not, the server now has this version or a newer one.
    store.markSynced(sent.map((r) => ({ key: r.key, t: r.updatedAt })));
    setStatus({ pending: store.dirtyKeys().length });
  };
  for (const key of keys) {
    const rec = store.rec(key);
    if (!rec) continue;
    const value = rec.d ? null : JSON.stringify(rec.v);
    const size = (value?.length ?? 0) + key.length + 60;
    if (batch.length && (batch.length >= MAX_BATCH_RECORDS || bytes + size > MAX_BATCH_BYTES)) await flush();
    batch.push({ key, updatedAt: rec.t, deleted: !!rec.d, value });
    bytes += size;
  }
  await flush();
}

async function pull() {
  if (!config) return;
  let changed = false;
  for (let page = 0; page < 200; page++) {
    const res = await request(`/sync/changes?after=${config.seq}`);
    const body = (await res.json()) as { rows: RemoteRow[]; more: boolean };
    for (const row of body.rows) {
      let rec: Rec;
      try {
        rec = row.deleted ? { v: null, t: row.updatedAt, d: 1 } : { v: JSON.parse(row.value ?? "null"), t: row.updatedAt };
      } catch {
        continue;
      }
      if (store.applyRemote(row.key, rec)) changed = true;
      config.seq = Math.max(config.seq, row.seq);
    }
    saveConfig();
    if (!body.more || body.rows.length === 0) break;
  }
  if (changed) store.notify();
}

async function runOnce() {
  if (!loadConfig()) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    setStatus({ phase: "offline", pending: store.dirtyKeys().length });
    return;
  }
  setStatus({ phase: "syncing", error: null });
  try {
    await push();
    await pull();
    setStatus({ phase: "idle", lastSyncedAt: Date.now(), error: null, pending: store.dirtyKeys().length });
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) {
      setStatus({ phase: "error", error: "The server did not accept this device's key. Open your device link again.", pending: store.dirtyKeys().length });
    } else if (error instanceof HttpError) {
      setStatus({ phase: "error", error: error.message, pending: store.dirtyKeys().length });
    } else {
      // The network failed. Nothing is lost: it is sent the next time.
      setStatus({ phase: "offline", pending: store.dirtyKeys().length });
    }
  }
}

/** Sends what changed here and fetches what changed elsewhere. */
export function syncNow(): Promise<void> {
  if (running) {
    again = true;
    return running;
  }
  running = runOnce().finally(() => {
    running = null;
    if (again) {
      again = false;
      void syncNow();
    }
  });
  return running;
}

const syncSoon = (ms = 2500) => {
  if (!loadConfig()) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void syncNow();
  }, ms);
};

/** Reads "#tc-key=…" from the address, if it is there, and removes it. */
export function takeKeyFromAddress(): string | null {
  const m = /^#tc-key=([A-Za-z0-9_-]{20,200})$/.exec(window.location.hash);
  if (!m) return null;
  history.replaceState(null, "", window.location.pathname + window.location.search + "#/");
  return m[1];
}

export interface LinkResult {
  ok: boolean;
  message: string;
}

/** Links this device. Checks the key with the server first. */
export async function linkDevice(key: string, server = ""): Promise<LinkResult> {
  const cleanKey = key.trim();
  const cleanServer = server.trim().replace(/\/+$/, "");
  if (!/^[A-Za-z0-9_-]{20,200}$/.test(cleanKey)) return { ok: false, message: "That does not look like a device key." };
  try {
    await request("/auth", {}, cleanKey, cleanServer);
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) return { ok: false, message: "The server did not accept that key." };
    if (error instanceof HttpError) return { ok: false, message: error.message };
    return { ok: false, message: "Could not reach the sync server. Check the address and your connection." };
  }
  loadConfig();
  config = { key: cleanKey, server: cleanServer, seq: 0 };
  saveConfig();
  // Send everything this device already has, then fetch the rest.
  store.markAllDirty();
  setStatus({ phase: "idle", linked: true, server: cleanServer, error: null });
  await syncNow();
  return { ok: true, message: "This device is linked." };
}

export function unlinkDevice() {
  loadConfig();
  config = null;
  saveConfig();
  setStatus({ phase: "off", linked: false, server: "", error: null, lastSyncedAt: null });
}

/** The link that connects another device. Contains the key, so keep it private. */
export function deviceLink(): string | null {
  if (!loadConfig() || !config) return null;
  const base = config.server || window.location.origin + window.location.pathname.replace(/\/+$/, "");
  return `${base}/#tc-key=${config.key}`;
}

/**
 * A request to the server this device is linked to, with the device key.
 * Returns null when this device is not linked. The caller reads the answer itself.
 */
export function linkedFetch(path: string, init: RequestInit = {}): Promise<Response> | null {
  if (!loadConfig() || !config) return null;
  return fetch(api(path), {
    ...init,
    headers: { ...(init.headers ?? {}), authorization: `Bearer ${config.key}`, ...(init.body ? { "content-type": "application/json" } : {}) },
    cache: "no-store",
  });
}

/** Asks the address whether a TururuCoding sync server lives there. */
export async function serverInfo(server = ""): Promise<{ found: boolean; configured: boolean }> {
  try {
    const res = await fetch(api("/info", server), { cache: "no-store" });
    if (!res.ok) return { found: false, configured: false };
    const body = (await res.json()) as { app?: string; configured?: boolean };
    return { found: body.app === "tururucoding", configured: !!body.configured };
  } catch {
    return { found: false, configured: false };
  }
}

let started = false;

/** Call once when the app starts. */
export function startSync() {
  if (started) return;
  started = true;
  loadConfig();
  store.subscribeDirty(() => {
    const pending = store.dirtyKeys().length;
    setStatus({ pending });
    if (pending) syncSoon();
  });
  window.addEventListener("online", () => void syncNow());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void syncNow();
  });
  setInterval(() => {
    if (document.visibilityState === "visible") void syncNow();
  }, 60_000);
  void syncNow();
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function useSyncStatus(): SyncStatus {
  loadConfig();
  return useSyncExternalStore(subscribe, () => status);
}
