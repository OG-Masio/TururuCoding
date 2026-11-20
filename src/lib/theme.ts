/**
 * Puts the chosen colors on the page.
 *
 * There are two layers:
 *   1. The paper look that belongs to TururuCoding: light or dark (the data-theme attribute).
 *   2. A VS Code theme from Settings. It always colors the code areas. With "whole
 *      site" on, it colors the pages too.
 *
 * A theme is applied by setting CSS variables on the page. The list of themes is
 * loaded only when it is needed. The variables of the current theme are also kept
 * on this device, so the next visit starts in the right colors at once.
 */
import { useSyncExternalStore } from "react";
import { getPrefs, store } from "./store";
import type { ThemePalette } from "./themes";

export const DEFAULT_THEME = "tururu";

const CACHE_KEY = "tc.theme-vars";

interface Cached {
  key: string;
  dark: boolean;
  vars: Record<string, string>;
}

/** The CSS variables a theme sets. */
export function variablesFor(theme: ThemePalette, wholeSite: boolean): Record<string, string> {
  const { code, tok, site } = theme;
  const vars: Record<string, string> = {
    "--code-bg": code.bg,
    "--code-bar": code.bar,
    "--code-line": code.line,
    "--code-fg": code.fg,
    "--code-dim": code.dim,
    "--code-selection": code.selection,
    "--code-active": code.activeLine,
    "--code-cursor": code.cursor,
    "--code-error": code.error,
    "--code-warn": code.warn,
    "--code-hi": code.hi,
    "--code-hi-ink": code.hiInk,
    "--tok-comment-style": theme.italicComments ? "italic" : "normal",
  };
  for (const [role, color] of Object.entries(tok)) vars[`--tok-${role}`] = color;
  if (wholeSite) {
    Object.assign(vars, {
      "--paper": site.paper,
      "--paper-2": site.paper2,
      "--ink": site.ink,
      "--pencil": site.pencil,
      "--rule": site.rule,
      "--rule-strong": site.ruleStrong,
      "--hi": site.hi,
      "--hi-ink": site.hiInk,
      "--done": site.done,
      "--link": site.link,
      "--warn": site.warn,
    });
  }
  return vars;
}

let loaded: ThemePalette[] | null = null;
let loading: Promise<ThemePalette[]> | null = null;

/** The list of themes. Loaded on first use. */
export function loadThemes(): Promise<ThemePalette[]> {
  loading ??= import("./themes").then((module) => {
    loaded = module.themes;
    return module.themes;
  });
  return loading;
}

// ------------------------------------------------------------- what is shown

interface ThemeState {
  /** The id of the code theme in use. */
  codeTheme: string;
  /** Is the code area dark? The editor needs to know. */
  codeDark: boolean;
}

let state: ThemeState = { codeTheme: DEFAULT_THEME, codeDark: true };
const listeners = new Set<() => void>();
let appliedNames: string[] = [];
let lastSignature = "";

const setState = (next: ThemeState) => {
  if (next.codeTheme === state.codeTheme && next.codeDark === state.codeDark) return;
  state = next;
  for (const fn of listeners) fn();
};

const readCache = (): Cached | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Cached) : null;
  } catch {
    return null;
  }
};

const writeCache = (cached: Cached | null) => {
  try {
    if (cached) localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    /* nothing to do: the theme is applied again after the list loads */
  }
};

const systemDark = () => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;

function paint(vars: Record<string, string>, paper: "light" | "dark") {
  const root = document.documentElement;
  for (const name of appliedNames) if (!(name in vars)) root.style.removeProperty(name);
  for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);
  appliedNames = Object.keys(vars);
  root.dataset.theme = paper;
  root.style.colorScheme = paper;
}

/** Reads the settings and colors the page. Safe to call often. */
export function applyTheme() {
  if (typeof document === "undefined") return;
  const prefs = getPrefs();
  const paperPref = prefs.theme === "auto" ? (systemDark() ? "dark" : "light") : prefs.theme;
  const id = prefs.codeTheme || DEFAULT_THEME;
  const wholeSite = prefs.themeWholeSite;
  const signature = `${id}|${wholeSite}|${paperPref}|${loaded ? "list" : "cache"}`;
  if (signature === lastSignature) return;

  if (id === DEFAULT_THEME) {
    lastSignature = signature;
    paint({}, paperPref);
    writeCache(null);
    setState({ codeTheme: id, codeDark: true });
    return;
  }

  const key = `${id}|${wholeSite}`;
  const theme = loaded?.find((t) => t.id === id);
  if (theme) {
    lastSignature = signature;
    const vars = variablesFor(theme, wholeSite);
    paint(vars, wholeSite ? (theme.dark ? "dark" : "light") : paperPref);
    writeCache({ key, dark: theme.dark, vars });
    setState({ codeTheme: id, codeDark: theme.dark });
    return;
  }

  if (loaded) {
    // The setting names a theme this version does not have. Fall back to the default look.
    lastSignature = signature;
    paint({}, paperPref);
    setState({ codeTheme: DEFAULT_THEME, codeDark: true });
    return;
  }

  // The list is not loaded yet: use what this device remembers, then load the list.
  const cached = readCache();
  if (cached && cached.key === key) {
    lastSignature = signature;
    paint(cached.vars, wholeSite ? (cached.dark ? "dark" : "light") : paperPref);
    setState({ codeTheme: id, codeDark: cached.dark });
  } else {
    paint({}, paperPref);
  }
  void loadThemes().then(applyTheme);
}

let started = false;

/** Call once, before the page is drawn. */
export function startTheme() {
  if (started) return;
  started = true;
  applyTheme();
  store.subscribe(applyTheme);
  if (typeof matchMedia === "function") matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function useThemeState(): ThemeState {
  return useSyncExternalStore(subscribe, () => state);
}
