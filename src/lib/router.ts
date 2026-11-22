/** A tiny router that keeps the current page in the address after "#". */
import { useSyncExternalStore } from "react";

export type Route =
  | { page: "map" }
  | { page: "unit"; unit: string }
  | { page: "lesson"; lesson: string }
  | { page: "check"; unit: string }
  | { page: "project"; unit: string }
  | { page: "capstone"; track: string }
  | { page: "work" }
  | { page: "guide"; tab: "guide" | "about" }
  | { page: "settings" }
  | { page: "missing" };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, "").replace(/^\/+|\/+$/g, "");
  if (!path) return { page: "map" };
  const [head, arg] = path.split("/");
  const value = arg ? decodeURIComponent(arg) : "";
  switch (head) {
    case "unit":
      return value ? { page: "unit", unit: value } : { page: "missing" };
    case "lesson":
      return value ? { page: "lesson", lesson: value } : { page: "missing" };
    case "check":
      return value ? { page: "check", unit: value } : { page: "missing" };
    case "project":
      return value ? { page: "project", unit: value } : { page: "missing" };
    case "capstone":
      return value ? { page: "capstone", track: value } : { page: "missing" };
    case "work":
      return { page: "work" };
    case "guide":
      if (!value) return { page: "guide", tab: "guide" };
      return value === "about" ? { page: "guide", tab: "about" } : { page: "missing" };
    case "settings":
      return { page: "settings" };
    default:
      return { page: "missing" };
  }
}

export const href = {
  map: () => "#/",
  unit: (unit: string) => `#/unit/${unit}`,
  lesson: (lesson: string) => `#/lesson/${lesson}`,
  check: (unit: string) => `#/check/${unit}`,
  project: (unit: string) => `#/project/${unit}`,
  capstone: (track: string) => `#/capstone/${track}`,
  work: () => "#/work",
  guide: () => "#/guide",
  about: () => "#/guide/about",
  settings: () => "#/settings",
};

const subscribe = (notify: () => void) => {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
};
const snapshot = () => window.location.hash;

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, snapshot);
  return parseRoute(hash);
}

export const go = (to: string) => {
  window.location.hash = to;
};
