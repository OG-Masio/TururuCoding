import type { MouseEvent } from "react";
import { DotLine } from "../components/DotLine";
import { courseProgress, nextStep, totals, tracks, unitProgress, units, type Track, type Unit } from "../lib/course";
import { useScrollTop } from "../lib/hooks";
import { href } from "../lib/router";
import { useStoreVersion } from "../lib/store";

export function MapPage() {
  useStoreVersion();
  useScrollTop("map");
  const step = nextStep();
  const progress = courseProgress();
  const nextId = step.kind === "lesson" ? step.lesson.id : step.kind === "project" ? step.unit.project.id : undefined;
  const begun = progress.done + progress.skipped > 0;
  const readyUnits = units.filter((u) => u.ready).length;

  return (
    <main className="page">
      <section className="resume" aria-label="Where you are">
        <div>
          {step.kind === "lesson" ? (
            <>
              <p className="resume__label">{begun ? "Continue where you stopped" : "Start here"}</p>
              <h1>{step.lesson.title}</h1>
              <p className="resume__where">
                Unit {step.lesson.unit.number}, lesson {step.lesson.number} of {step.lesson.unit.lessons.length}. {step.lesson.unit.title}
              </p>
            </>
          ) : step.kind === "project" ? (
            <>
              <p className="resume__label">All lessons of unit {step.unit.number} are done. Now build the unit project</p>
              <h1>{step.unit.project.title}</h1>
              <p className="resume__where">{step.unit.project.summary}</p>
            </>
          ) : (
            <>
              <p className="resume__label">You are up to date</p>
              <h1>Everything written so far is done</h1>
              <p className="resume__where">
                {step.unit ? `The next unit to be written is unit ${step.unit.number}: ${step.unit.title}.` : "The whole course is finished."}
              </p>
            </>
          )}
        </div>
        <div className="resume__side">
          {step.kind === "lesson" ? (
            <a className="btn btn--hi" href={href.lesson(step.lesson.id)}>
              {begun ? "Continue" : "Open lesson 1"}
            </a>
          ) : step.kind === "project" ? (
            <a className="btn btn--hi" href={href.project(step.unit.id)}>
              Open the project
            </a>
          ) : step.unit ? (
            <a className="btn" href={href.unit(step.unit.id)}>
              See what comes next
            </a>
          ) : null}
          <p className="resume__count">
            <strong>{progress.done}</strong> of {totals.lessons} lessons done
            {progress.skipped ? `, ${progress.skipped} skipped` : ""}
          </p>
        </div>
      </section>

      <nav className="trackjump" aria-label="Tracks">
        {tracks.map((track) => (
          <a key={track.id} href={`#/`} onClick={(e) => jump(e, track.id)}>
            {track.number}. {track.title}
          </a>
        ))}
      </nav>

      <p className="small muted" style={{ margin: "6px 0 0", maxWidth: "74ch" }}>
        The full road: {totals.tracks} tracks, {totals.units} units, {totals.lessons} lessons. {readyUnits === 1 ? "Unit 1 is" : `Units 1 to ${readyUnits} are`} written. The
        other units are planned and get written one at a time. Each dot is a lesson, each square is a unit project.
      </p>

      {tracks.map((track) => (
        <TrackSection key={track.id} track={track} nextId={nextId} />
      ))}
    </main>
  );
}

const jump = (event: MouseEvent, id: string) => {
  event.preventDefault();
  document.getElementById(`track-${id}`)?.scrollIntoView({ behavior: "smooth" });
};

function TrackSection({ track, nextId }: { track: Track; nextId?: string }) {
  const lessonCount = track.units.reduce((n, u) => n + u.lessons.length, 0);
  const done = track.units.reduce((n, u) => n + unitProgress(u).done, 0);
  return (
    <section className="track" id={`track-${track.id}`} aria-labelledby={`track-${track.id}-title`}>
      <div className="track__head">
        <span className="track__num">Track {track.number}</span>
        <h2 id={`track-${track.id}-title`}>{track.title}</h2>
        <span className="track__count">
          {done} of {lessonCount} lessons
        </span>
        <p className="track__summary">{track.summary}</p>
        <p className="track__after">Start after: {track.startAfter}</p>
      </div>
      <ul className="unitrows">
        {track.units.map((unit) => (
          <UnitRow key={unit.id} unit={unit} nextId={nextId} />
        ))}
        <li className="unitrow unitrow--capstone">
          <span className="unitrow__num" aria-hidden="true">
            ◆
          </span>
          <a className="unitrow__title" href={href.capstone(track.id)} style={{ color: "inherit", textDecoration: "none" }}>
            {track.capstone.title}
          </a>
          <span className="unitrow__desc">{track.capstone.summary}</span>
          <span className="unitrow__state">Planned</span>
        </li>
      </ul>
    </section>
  );
}

function UnitRow({ unit, nextId }: { unit: Unit; nextId?: string }) {
  const p = unitProgress(unit);
  const state = !unit.ready
    ? "Not written yet"
    : p.complete && (p.projectDone || p.done === 0)
      ? p.done === 0
        ? "Skipped"
        : "Finished"
      : p.done + p.skipped > 0
        ? `${p.done + p.skipped} of ${p.total} lessons`
        : "Ready";
  return (
    <li className="unitrow">
      <span className="unitrow__num">{String(unit.number).padStart(2, "0")}</span>
      <a className="unitrow__title" href={href.unit(unit.id)} style={{ color: "inherit", textDecoration: "none" }}>
        {unit.title}
      </a>
      <DotLine unit={unit} nextId={nextId} />
      <span className="unitrow__state" data-ready={unit.ready ? "true" : "false"}>
        {state}
      </span>
    </li>
  );
}
