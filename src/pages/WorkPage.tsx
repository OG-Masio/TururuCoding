import { Preview } from "../components/Preview";
import { findLesson, findUnit } from "../lib/course";
import { download } from "../lib/download";
import { useScrollTop, useTitle } from "../lib/hooks";
import { buildStandalone } from "../lib/preview";
import { href } from "../lib/router";
import { store, useStoreVersion, type CodeRecord, type ProjectRecord } from "../lib/store";

interface WorkItem {
  id: string;
  title: string;
  where: string;
  link: string;
  files: Record<string, string>;
  changedAt: number;
  isProject: boolean;
  url?: string;
}

const describe = (id: string, files: Record<string, string>, changedAt: number): WorkItem | null => {
  const lesson = findLesson(id);
  if (lesson) {
    return { id, title: lesson.title, where: `Unit ${lesson.unit.number}, lesson ${lesson.number}`, link: href.lesson(id), files, changedAt, isProject: false };
  }
  const m = /^(.*)-(check|project)$/.exec(id);
  const unit = m ? findUnit(m[1]) : undefined;
  if (!unit || !m) return null;
  if (m[2] === "check") return { id, title: `Quick check: ${unit.title}`, where: `Unit ${unit.number}`, link: href.check(unit.id), files, changedAt, isProject: false };
  const record = store.get<ProjectRecord>(`project:${id}`);
  return { id, title: unit.project.title, where: `Unit ${unit.number} project`, link: href.project(unit.id), files, changedAt, isProject: true, url: record?.url };
};

const day = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

export function WorkPage() {
  useStoreVersion();
  useScrollTop("work");
  useTitle("My work");
  const items = store
    .entries<CodeRecord>("code:")
    .filter(([, value]) => value?.files && Object.values(value.files).some((text) => text.trim() !== ""))
    .map(([key, value, t]) => describe(key.slice(5), value.files, t))
    .filter((item): item is WorkItem => item !== null)
    .sort((a, b) => b.changedAt - a.changedAt);
  const projects = items.filter((i) => i.isProject);
  const exercises = items.filter((i) => !i.isProject);

  return (
    <main className="page">
      <h1 style={{ fontSize: "clamp(32px, 4.6vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em" }}>My work</h1>
      <p className="lead" style={{ marginTop: 10 }}>
        Everything you wrote in the editor is kept here, running. Open one to keep working on it, or download it as a real file.
      </p>

      {items.length === 0 ? (
        <div className="callout">
          <p>
            <strong>Nothing here yet.</strong> The code you write in a lesson is saved by itself and shows up on this page.
          </p>
          <p>
            <a className="btn btn--hi" href={href.map()}>
              Open the map and start
            </a>
          </p>
        </div>
      ) : null}

      {projects.length ? (
        <>
          <h2 className="sectionhead">Projects</h2>
          <div className="worklist">
            {projects.map((item) => (
              <WorkCard key={item.id} item={item} />
            ))}
          </div>
        </>
      ) : null}

      {exercises.length ? (
        <>
          <h2 className="sectionhead">Lessons</h2>
          <div className="worklist">
            {exercises.map((item) => (
              <WorkCard key={item.id} item={item} />
            ))}
          </div>
        </>
      ) : null}
    </main>
  );
}

function WorkCard({ item }: { item: WorkItem }) {
  return (
    <div className="work">
      <a className="work__thumb" href={item.link} style={{ display: "block" }} aria-label={`Open ${item.title}`}>
        <Preview files={item.files} title={`Your code for ${item.title}`} delay={0} lazy />
      </a>
      <a className="work__title" href={item.link}>
        {item.title}
      </a>
      <div className="work__meta">
        <span>{item.where}</span>
        <span>Changed {day.format(item.changedAt)}</span>
        <button type="button" className="linkbtn" onClick={() => download(`${item.id}.html`, buildStandalone(item.files), "text/html")}>
          Download
        </button>
        {item.url ? (
          <a href={item.url} target="_blank" rel="noopener">
            Online version
          </a>
        ) : null}
      </div>
    </div>
  );
}
