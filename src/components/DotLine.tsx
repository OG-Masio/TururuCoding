import type { Unit } from "../lib/course";
import { href } from "../lib/router";
import { store, type LessonRecord, type ProjectRecord } from "../lib/store";

interface Props {
  unit: Unit;
  /** The lesson to highlight as "next". */
  nextId?: string;
}

/** One dot per lesson and a square for the unit project. */
export function DotLine({ unit, nextId }: Props) {
  const projectDone = store.get<ProjectRecord>(`project:${unit.project.id}`)?.s === "done";
  return (
    <div className="dotline" aria-hidden={unit.ready ? undefined : true}>
      {unit.lessons.map((lesson) => {
        const saved = store.get<LessonRecord>(`lesson:${lesson.id}`)?.s;
        const state = !unit.ready ? "planned" : saved === "done" || saved === "skipped" ? saved : lesson.id === nextId ? "next" : (saved ?? "todo");
        const words = { planned: "not written yet", done: "done", skipped: "skipped", next: "next", started: "started", todo: "not started" }[state];
        const label = `Lesson ${lesson.number}: ${lesson.title} (${words})`;
        return unit.ready ? (
          <a key={lesson.id} className="dot" data-state={state} href={href.lesson(lesson.id)} title={label} aria-label={label} />
        ) : (
          <span key={lesson.id} className="dot" data-state={state} title={label} />
        );
      })}
      {unit.ready ? (
        <a
          className="dot dot--project"
          data-state={projectDone ? "done" : nextId === unit.project.id ? "next" : "todo"}
          href={href.project(unit.id)}
          title={`Project: ${unit.project.title}`}
          aria-label={`Project: ${unit.project.title} (${projectDone ? "done" : "not done"})`}
        />
      ) : (
        <span className="dot dot--project" data-state="planned" title={`Project: ${unit.project.title}`} />
      )}
    </div>
  );
}
