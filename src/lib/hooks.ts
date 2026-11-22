import { useEffect, useRef, useState } from "react";

export type Loaded<T> = { state: "loading" } | { state: "error"; message: string } | { state: "ready"; value: T };

/** Loads something when `key` changes. */
export function useLoaded<T>(load: () => Promise<T>, key: string): Loaded<T> {
  const [result, setResult] = useState<{ key: string; loaded: Loaded<T> }>({ key, loaded: { state: "loading" } });
  useEffect(() => {
    let alive = true;
    load().then(
      (value) => alive && setResult({ key, loaded: { state: "ready", value } }),
      (error: unknown) => alive && setResult({ key, loaded: { state: "error", message: error instanceof Error ? error.message : String(error) } }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return result.key === key ? result.loaded : { state: "loading" };
}

/** Calls `save` a moment after the last change, and once more when the page closes. */
export function useDebouncedSave<T>(value: T, save: (value: T) => void, enabled: boolean, ms = 500) {
  const latest = useRef({ value, save, enabled, pending: false });
  latest.current.value = value;
  latest.current.save = save;
  latest.current.enabled = enabled;

  useEffect(() => {
    if (!enabled) return;
    latest.current.pending = true;
    const timer = setTimeout(() => {
      latest.current.pending = false;
      save(value);
    }, ms);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, enabled, ms]);

  useEffect(() => {
    const flush = () => {
      if (latest.current.pending && latest.current.enabled) {
        latest.current.pending = false;
        latest.current.save(latest.current.value);
      }
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);
}

/** Scrolls to the top when the page changes. */
export function useScrollTop(key: string) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [key]);
}

/** Sets the text on the browser tab. */
export function useTitle(title: string | null | undefined) {
  useEffect(() => {
    document.title = title ? `${title} | TururuCoding` : "TururuCoding";
    return () => {
      document.title = "TururuCoding";
    };
  }, [title]);
}
