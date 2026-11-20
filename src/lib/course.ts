/**
 * Turns the curriculum map (content/curriculum.ts) into objects with ids and
 * numbers, and loads lesson files when a page needs them.
 */
import { tracks as trackSpecs, type RunsIn } from "../../content/curriculum";
import { parseDoc, type ParsedDoc } from "./lesson";
import { store, type LessonRecord, type ProjectRecord } from "./store";

export interface LessonInfo {
  id: string;
  /** 1, 2, 3 … inside the unit. */
  number: number;
  title: string;
  unit: Unit;
}

export interface Unit {
  id: string;
  /** 1 … 37 across the whole course. */
  number: number;
  title: string;
  summary: string;
  outcomes: string[];
  runsIn: RunsIn;
  ready: boolean;
  folder: string | null;
  lessons: LessonInfo[];
  project: { id: string; title: string; summary: string };
  checkId: string;
  track: Track;
}

export interface Track {
  id: string;
  number: number;
  title: string;
  summary: string;
  why: string;
  startAfter: string;
  units: Unit[];
  capstone: { id: string; title: string; summary: string; youBuild: string[] };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

let unitCounter = 0;
export const tracks: Track[] = trackSpecs.map((spec, t) => {
  const track: Track = {
    id: spec.id,
    number: t + 1,
    title: spec.title,
    summary: spec.summary,
    why: spec.why,
    startAfter: spec.startAfter,
    units: [],
    capstone: { id: `${spec.id}-capstone`, ...spec.capstone },
  };
  track.units = spec.units.map((u) => {
    unitCounter += 1;
    const unit: Unit = {
      id: u.id,
      number: unitCounter,
      title: u.title,
      summary: u.summary,
      outcomes: u.outcomes,
      runsIn: u.runsIn,
      ready: !!u.ready,
      folder: u.folder ?? null,
      lessons: [],
      project: { id: `${u.id}-project`, ...u.project },
      checkId: `${u.id}-check`,
      track,
    };
    unit.lessons = u.lessons.map((title, i) => ({ id: `${u.id}-${pad2(i + 1)}`, number: i + 1, title, unit }));
    return unit;
  });
  return track;
});

export const units: Unit[] = tracks.flatMap((t) => t.units);
export const lessons: LessonInfo[] = units.flatMap((u) => u.lessons);

const unitById = new Map(units.map((u) => [u.id, u]));
const lessonById = new Map(lessons.map((l) => [l.id, l]));
const trackById = new Map(tracks.map((t) => [t.id, t]));

export const findUnit = (id: string) => unitById.get(id);
export const findLesson = (id: string) => lessonById.get(id);
export const findTrack = (id: string) => trackById.get(id);

export const totals = {
  tracks: tracks.length,
  units: units.length,
  lessons: lessons.length,
  readyLessons: units.filter((u) => u.ready).reduce((n, u) => n + u.lessons.length, 0),
};

export const runsInLabel: Record<RunsIn, string> = {
  site: "In the site editor",
  computer: "On your computer",
  both: "Site editor and your computer",
};

// ------------------------------------------------------------------ content

const loaders = import.meta.glob("/content/units/**/*.md", { query: "?raw", import: "default" }) as Record<string, () => Promise<string>>;
const guideLoaders = import.meta.glob("/content/*.md", { query: "?raw", import: "default" }) as Record<string, () => Promise<string>>;

const docCache = new Map<string, Promise<ParsedDoc>>();

const loadDoc = (path: string | undefined): Promise<ParsedDoc> => {
  if (!path || !(path in loaders)) return Promise.reject(new Error("This page is not written yet."));
  let doc = docCache.get(path);
  if (!doc) {
    doc = loaders[path]().then(parseDoc);
    docCache.set(path, doc);
  }
  return doc;
};

const fileIn = (unit: Unit, startsWith: string) => {
  if (!unit.folder) return undefined;
  const prefix = `/content/units/${unit.folder}/${startsWith}`;
  return Object.keys(loaders).find((p) => p.startsWith(prefix));
};

export const loadLessonDoc = (lesson: LessonInfo) => loadDoc(fileIn(lesson.unit, `${pad2(lesson.number)}-`));
export const loadCheckDoc = (unit: Unit) => loadDoc(fileIn(unit, "check"));
export const loadProjectDoc = (unit: Unit) => loadDoc(fileIn(unit, "project"));
export const hasCheck = (unit: Unit) => !!fileIn(unit, "check");

export const loadGuide = (): Promise<string> => {
  const loader = guideLoaders["/content/guide.md"];
  return loader ? loader() : Promise.resolve("");
};

// ----------------------------------------------------------------- progress

export interface UnitProgress {
  done: number;
  skipped: number;
  started: number;
  total: number;
  projectDone: boolean;
  /** Every lesson is done or skipped. */
  complete: boolean;
}

export function unitProgress(unit: Unit): UnitProgress {
  let done = 0;
  let skipped = 0;
  let started = 0;
  for (const lesson of unit.lessons) {
    const s = store.get<LessonRecord>(`lesson:${lesson.id}`)?.s;
    if (s === "done") done++;
    else if (s === "skipped") skipped++;
    else if (s === "started") started++;
  }
  const projectDone = store.get<ProjectRecord>(`project:${unit.project.id}`)?.s === "done";
  return { done, skipped, started, total: unit.lessons.length, projectDone, complete: done + skipped === unit.lessons.length };
}

export interface CourseProgress {
  done: number;
  skipped: number;
  total: number;
  projectsDone: number;
}

export function courseProgress(): CourseProgress {
  let done = 0;
  let skipped = 0;
  let projectsDone = 0;
  for (const unit of units) {
    const p = unitProgress(unit);
    done += p.done;
    skipped += p.skipped;
    if (p.projectDone) projectsDone++;
  }
  return { done, skipped, total: lessons.length, projectsDone };
}

export type NextStep = { kind: "lesson"; lesson: LessonInfo } | { kind: "project"; unit: Unit } | { kind: "caught-up"; unit: Unit | null };

/** The first thing in the written units that is not done yet. */
export function nextStep(): NextStep {
  for (const unit of units) {
    if (!unit.ready) continue;
    for (const lesson of unit.lessons) {
      const s = store.get<LessonRecord>(`lesson:${lesson.id}`)?.s;
      if (s !== "done" && s !== "skipped") return { kind: "lesson", lesson };
    }
    const project = store.get<ProjectRecord>(`project:${unit.project.id}`);
    if (project?.s !== "done" && !unit.lessons.every((l) => store.get<LessonRecord>(`lesson:${l.id}`)?.s === "skipped")) {
      return { kind: "project", unit };
    }
  }
  return { kind: "caught-up", unit: units.find((u) => !u.ready) ?? null };
}

export const lessonAfter = (lesson: LessonInfo): LessonInfo | null => lesson.unit.lessons[lesson.number] ?? null;
export const lessonBefore = (lesson: LessonInfo): LessonInfo | null => lesson.unit.lessons[lesson.number - 2] ?? null;
