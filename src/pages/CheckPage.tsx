import { useCallback, useMemo, useState } from "react";
import { Bench } from "../components/Bench";
import { CodeBox } from "../components/CodeBox";
import { Frame } from "../components/Frame";
import { Markdown } from "../components/Markdown";
import { Notice, type NoticeData } from "../components/Notice";
import { TitleBlock } from "../components/TitleBlock";
import { Tutor } from "../components/Tutor";
import { findUnit, loadCheckDoc, units, type Unit } from "../lib/course";
import { useDebouncedSave, useLoaded, useScrollTop, useTitle } from "../lib/hooks";
import { toQuickCheck, type Files, type QuickCheck } from "../lib/lesson";
import { go, href } from "../lib/router";
import { asContext, codeAsText } from "../lib/tutor";
import { lessonState, saveCode, savedCode, setLessonState, useStoreVersion } from "../lib/store";
import { Missing } from "./Missing";

export function CheckPage({ unitId }: { unitId: string }) {
  const unit = findUnit(unitId);
  useScrollTop(`check-${unitId}`);
  useTitle(unit ? `Quick check: unit ${unit.number}` : null);
  const loaded = useLoaded(async () => (unit && unit.ready ? toQuickCheck(await loadCheckDoc(unit)) : null), `check-${unitId}`);
  if (!unit) return <Missing what="unit" />;
  if (loaded.state === "loading") return <main className="page page--narrow muted">Loading the quick check…</main>;
  if (loaded.state === "error" || !loaded.value) {
    return (
      <main className="page page--narrow">
        <p className="lead">This unit has no quick check yet.</p>
        <p>
          <a className="btn" href={href.unit(unit.id)}>
            Back to the unit
          </a>
        </p>
      </main>
    );
  }
  return <CheckView key={unitId} unit={unit} check={loaded.value} />;
}

function CheckView({ unit, check }: { unit: Unit; check: QuickCheck }) {
  useStoreVersion();
  const [files, setFilesState] = useState<Files>(() => ({ ...check.starter, ...(savedCode(unit.checkId) ?? {}) }));
  const [touched, setTouched] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [view, setView] = useState<"read" | "code">("read");
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);
  const setFiles = (next: Files) => {
    setFilesState(next);
    setTouched(true);
  };
  useDebouncedSave(files, (value) => saveCode(unit.checkId, value), touched);

  const tutorContext = useMemo(
    () =>
      asContext([
        "This is the quick check of the unit: one task that uses everything the unit teaches. The learner can skip the unit when nothing in it is new.",
        check.intro,
        `The task:\n${check.task}`,
        `The answer code:\n${codeAsText(check.answer, check.fileOrder)}`,
        check.explanation && `The explanation:\n${check.explanation}`,
      ]),
    [check],
  );

  const passedCount = check.checks.filter((_, i) => results[i]).length;
  /** A unit about servers and tools: the code runs on your computer, so the page has no editor. */
  const computer = unit.runsIn === "computer";
  const nextUnit = units[unit.number];

  const skipUnit = () => {
    for (const lesson of unit.lessons) if (lessonState(lesson.id) !== "done") setLessonState(lesson.id, "skipped");
    go(nextUnit ? href.unit(nextUnit.id) : href.map());
  };

  return (
    <div className={computer ? "lesson lesson--computer" : "lesson"} data-view={view}>
      {computer ? null : (
        <div className="viewswitch" role="group" aria-label="What to show">
          <button type="button" aria-pressed={view === "read"} onClick={() => setView("read")}>
            Quick check
          </button>
          <button type="button" aria-pressed={view === "code"} onClick={() => setView("code")}>
            Your code
          </button>
        </div>
      )}

      <main className="lesson__pad">
        <TitleBlock
          title={`Quick check: ${unit.title}`}
          meta={
            <>
              <a href={href.unit(unit.id)}>Unit {unit.number}</a>
              <span>Skip check</span>
            </>
          }
        />
        <div className="lead">
          <Markdown source={check.intro} />
        </div>

        <section className="step step--twist">
          <div className="step__head">
            <span className="step__num">?</span>
            <h2>Can you build this?</h2>
          </div>
          <div className="twisttask">
            <Markdown source={check.task} />
          </div>
          {check.checks.length ? (
            <>
              <ul className="checks" aria-label="Checks">
                {check.checks.map((item, i) => (
                  <li key={i} data-ok={results[i] ? "true" : "false"}>
                    <span className="checks__mark" aria-hidden="true" />
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
              <p className="checks__note">
                {passedCount} of {check.checks.length} checks pass.
              </p>
            </>
          ) : null}
        </section>

        <section className="step">
          <div className="step__head">
            <span className="step__num">=</span>
            <h2>The answer</h2>
          </div>
          <CodeBox
            files={check.answer}
            fileOrder={check.fileOrder}
            label="Answer"
            actions={
              computer ? null : (
                <button
                  type="button"
                  className="btn btn--small btn--quiet"
                  onClick={() => {
                    const before = files;
                    setFiles({ ...check.answer });
                    setView("code");
                    setNotice({ text: "The answer is in your editor.", action: { label: "Undo", run: () => setFiles(before) } });
                  }}
                >
                  Put it in my editor
                </button>
              )
            }
          />
          {computer ? null : <Frame files={check.answer} label="Result" />}
          {check.explanation ? <Markdown source={check.explanation} /> : null}
        </section>

        <div className="finish">
          <p style={{ maxWidth: "62ch" }}>
            If you could write this without looking, or you read the answer and nothing in it is new to you, skip the unit. If parts of it are new, do the lessons. They are
            short.
          </p>
          <div className="row">
            <button type="button" className="btn btn--primary" onClick={skipUnit}>
              I can do this. Skip unit {unit.number}
            </button>
            <a className="btn btn--hi" href={href.lesson(unit.lessons[0].id)}>
              Not yet. Start lesson 1
            </a>
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>
            Skipped lessons stay open. You can come back and do any of them later.
          </p>
        </div>
      </main>

      {computer ? null : (
        <aside className="lesson__bench" aria-label="Your code and its result">
          <Bench label="Your code" files={files} fileOrder={check.fileOrder} onChange={setFiles} checks={check.checks} onChecks={setResults} placeholder="Build it here…" />
        </aside>
      )}
      <Tutor what="quick check" pageId={`check:${unit.id}`} title={`Quick check of unit ${unit.number}: ${unit.title}`} context={tutorContext} files={computer ? {} : files} fileOrder={computer ? [] : check.fileOrder} />
      <Notice notice={notice} onClose={closeNotice} />
    </div>
  );
}
