import { useCallback, useEffect, useState } from "react";
import { Notice, type NoticeData } from "./components/Notice";
import { href, useRoute, type Route } from "./lib/router";
import { getPrefs, useStoreVersion } from "./lib/store";
import { linkDevice, startSync, takeKeyFromAddress, useSyncStatus } from "./lib/sync";
import { CapstonePage } from "./pages/CapstonePage";
import { CheckPage } from "./pages/CheckPage";
import { GuidePage } from "./pages/GuidePage";
import { LessonPage } from "./pages/LessonPage";
import { MapPage } from "./pages/MapPage";
import { Missing } from "./pages/Missing";
import { ProjectPage } from "./pages/ProjectPage";
import { SettingsPage } from "./pages/SettingsPage";
import { UnitPage } from "./pages/UnitPage";
import { WorkPage } from "./pages/WorkPage";

// A device link was opened: take the key out of the address before anything else reads it.
const keyFromAddress = takeKeyFromAddress();

function useTheme() {
  useStoreVersion();
  const theme = getPrefs().theme;
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme = theme === "auto" ? (media.matches ? "dark" : "light") : theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
}

const Mark = () => (
  <svg width="30" height="22" viewBox="0 0 30 22" aria-hidden="true">
    <path d="M1 20.5h28" stroke="currentColor" strokeWidth="2" />
    <circle cx="5.5" cy="14.5" r="4" fill="currentColor" />
    <circle cx="15" cy="9.5" r="4" fill="currentColor" />
    <circle cx="24.5" cy="4.5" r="4" fill="currentColor" />
  </svg>
);

function SyncChip() {
  const sync = useSyncStatus();
  const text = !sync.linked
    ? "This device only"
    : sync.phase === "syncing"
      ? "Syncing"
      : sync.phase === "offline"
        ? "Offline"
        : sync.phase === "error"
          ? "Sync problem"
          : "Synced";
  return (
    <a className="syncchip" data-phase={sync.phase} href={href.settings()} title="Open Settings, Your devices">
      <span className="syncchip__dot" aria-hidden="true" />
      <span className="syncchip__text">{text}</span>
    </a>
  );
}

const section = (route: Route): "map" | "work" | "guide" | "settings" => (route.page === "work" || route.page === "guide" || route.page === "settings" ? route.page : "map");

export function App() {
  useTheme();
  const route = useRoute();
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  useEffect(() => {
    startSync();
    if (keyFromAddress) {
      void linkDevice(keyFromAddress).then((result) => setNotice({ text: result.ok ? "This device is linked. Your progress now syncs." : `This device was not linked. ${result.message}` }));
    }
  }, []);

  const current = section(route);
  const nav: [typeof current, string, string][] = [
    ["map", "Map", href.map()],
    ["work", "My work", href.work()],
    ["guide", "Guide", href.guide()],
    ["settings", "Settings", href.settings()],
  ];

  return (
    <>
      <header className="topbar">
        <a className="brand" href={href.map()} aria-label="TururuCoding, open the map">
          <Mark />
          <span>TururuCoding</span>
        </a>
        <nav className="topnav" aria-label="Main">
          {nav.map(([id, label, to]) => (
            <a key={id} href={to} aria-current={current === id ? "page" : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <SyncChip />
      </header>

      {route.page === "map" ? <MapPage /> : null}
      {route.page === "unit" ? <UnitPage unitId={route.unit} /> : null}
      {route.page === "lesson" ? <LessonPage lessonId={route.lesson} /> : null}
      {route.page === "check" ? <CheckPage unitId={route.unit} /> : null}
      {route.page === "project" ? <ProjectPage unitId={route.unit} /> : null}
      {route.page === "capstone" ? <CapstonePage trackId={route.track} /> : null}
      {route.page === "work" ? <WorkPage /> : null}
      {route.page === "guide" ? <GuidePage /> : null}
      {route.page === "settings" ? <SettingsPage /> : null}
      {route.page === "missing" ? <Missing /> : null}

      <Notice notice={notice} onClose={closeNotice} />
    </>
  );
}
