import { TitleBlock } from "../components/TitleBlock";
import { findUnit, hasCheck, runsInLabel, unitProgress, units } from "../lib/course";
import { useScrollTop, useTitle } from "../lib/hooks";
import { href } from "../lib/router";
import { store, useStoreVersion, type LessonRecord, type ProjectRecord } from "../lib/store";
import { Missing } from "./Missing";

const stateWords: Record<string, string> = { done: "Done", skipped: "Skipped", started: "Started" };

export function UnitPage({ unitId }: { unitId: string }) {
  useStoreVersion();
  useScrollTop(`unit-${unitId}`);
  const unit = findUnit(unitId);
  useTitle(unit ? `Unit ${unit.number}: ${unit.title}` : null);
  if (!unit) return <Missing what="unit" />;
  const progress = unitProgress(unit);
  const project = store.get<ProjectRecord>(`project:${unit.project.id}`);
  const firstOpen = unit.lessons.find((l) => {
    const s = store.get<LessonRecord>(`lesson:${l.id}`)?.s;
    return s !== "done" && s !== "skipped";
  });
  const nextUnit = units[unit.number];

  return (
    <main className="page page--narrow">
      <TitleBlock
        title={unit.title}
        meta={
          <>
            <a href={href.map()}>Track {unit.track.number}</a>
            <span>Unit {unit.number}</span>
            <span>{unit.lessons.length} lessons and a project</span>
            <span>{runsInLabel[unit.runsIn]}</span>
          </>
        }
        state={
          unit.ready && progress.complete
            ? progress.done === 0
              ? { kind: "skipped", label: "Skipped" }
              : progress.projectDone
                ? { kind: "done", label: "Finished" }
                : null
            : null
        }
      />

      <p className="lead">{unit.summary}</p>

      <h2 className="sectionhead">After this unit you can</h2>
      <ul className="outcomes">
        {unit.outcomes.map((outcome) => (
          <li key={outcome}>{outcome}</li>
        ))}
      </ul>

      {unit.ready ? (
        <div className="row" style={{ marginBottom: 6 }}>
          {firstOpen ? (
            <a className="btn btn--hi" href={href.lesson(firstOpen.id)}>
              {progress.done + progress.skipped + progress.started > 0 ? `Continue with lesson ${firstOpen.number}` : "Start lesson 1"}
            </a>
          ) : (
            <a className="btn btn--hi" href={href.project(unit.id)}>
              {project?.s === "done" ? "Open the unit project again" : "Build the unit project"}
            </a>
          )}
          {hasCheck(unit) ? (
            <a className="btn" href={href.check(unit.id)}>
              I know this already. Show me the quick check
            </a>
          ) : null}
        </div>
      ) : (
        <div className="callout callout--quiet">
          <p>
            <strong>This unit is planned, not written yet.</strong> The lesson titles below are fixed, so you can see where the course goes. Lessons are written one unit at a
            time, in order.
          </p>
        </div>
      )}

      <h2 className="sectionhead">Lessons</h2>
      <ol className="lessonlist">
        {unit.lessons.map((lesson) => {
          const s = store.get<LessonRecord>(`lesson:${lesson.id}`)?.s;
          const inner = (
            <>
              <span className="muted" style={{ fontFamily: "var(--mono)", fontSize: 14 }}>
                {String(lesson.number).padStart(2, "0")}
              </span>
              <span className="lessonlist__title">{lesson.title}</span>
              <span className="lessonlist__state">{s ? stateWords[s] : ""}</span>
            </>
          );
          return (
            <li key={lesson.id}>
              {unit.ready ? (
                <a className="lessonlist__item" data-state={s} href={href.lesson(lesson.id)}>
                  {inner}
                </a>
              ) : (
                <span className="lessonlist__item">{inner}</span>
              )}
            </li>
          );
        })}
      </ol>

      <h2 className="sectionhead">Unit project</h2>
      <ol className="lessonlist">
        <li>
          {unit.ready ? (
            <a className="lessonlist__item" data-state={project?.s === "done" ? "done" : undefined} href={href.project(unit.id)}>
              <span aria-hidden="true">■</span>
              <span>
                <span className="lessonlist__title">{unit.project.title}</span>
                <br />
                <span className="small muted">{unit.project.summary}</span>
              </span>
              <span className="lessonlist__state">{project?.s === "done" ? "Done" : project?.s === "started" ? "Started" : ""}</span>
            </a>
          ) : (
            <span className="lessonlist__item">
              <span aria-hidden="true">■</span>
              <span>
                <span className="lessonlist__title">{unit.project.title}</span>
                <br />
                <span className="small muted">{unit.project.summary}</span>
              </span>
              <span />
            </span>
          )}
        </li>
      </ol>

      <p className="row" style={{ marginTop: 28 }}>
        <a href={href.map()}>Back to the map</a>
        {nextUnit ? (
          <a href={href.unit(nextUnit.id)}>
            Next unit: {nextUnit.title}
          </a>
        ) : null}
      </p>
    </main>
  );
}
