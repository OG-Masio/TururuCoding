import { useCallback, useMemo, useState } from "react";
import { Bench } from "../components/Bench";
import { CodeBox } from "../components/CodeBox";
import { Frame } from "../components/Frame";
import { Markdown } from "../components/Markdown";
import { Notice, type NoticeData } from "../components/Notice";
import { TitleBlock } from "../components/TitleBlock";
import { Tutor } from "../components/Tutor";
import { findLesson, lessonAfter, lessonBefore, loadLessonDoc, type LessonInfo } from "../lib/course";
import { useDebouncedSave, useLoaded, useScrollTop, useTitle } from "../lib/hooks";
import { toLesson, type Files, type Lesson } from "../lib/lesson";
import { go, href } from "../lib/router";
import { asContext, codeAsText } from "../lib/tutor";
import { getPrefs, lessonState, saveCode, savedCode, setLessonState, touchLesson, useStoreVersion } from "../lib/store";
import { ComputerLesson } from "./ComputerLesson";
import { Missing } from "./Missing";

const sameFiles = (a: Files, b: Files) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) if ((a[k] ?? "").trim() !== (b[k] ?? "").trim()) return false;
  return true;
};

const isEmpty = (files: Files) => Object.values(files).every((text) => text.trim() === "");

export function LessonPage({ lessonId }: { lessonId: string }) {
  const info = findLesson(lessonId);
  useScrollTop(lessonId);
  useTitle(info ? `${info.number}. ${info.title}` : null);
  const loaded = useLoaded(async () => (info && info.unit.ready ? toLesson(await loadLessonDoc(info)) : null), lessonId);

  if (!info) return <Missing what="lesson" />;

  if (!info.unit.ready) {
    return (
      <main className="page page--narrow">
        <TitleBlock
          title={info.title}
          meta={
            <>
              <a href={href.unit(info.unit.id)}>Unit {info.unit.number}</a>
              <span>
                Lesson {info.number} of {info.unit.lessons.length}
              </span>
            </>
          }
        />
        <p className="lead">This lesson is on the map, but it is not written yet.</p>
        <p>Lessons are written one unit at a time. The unit page shows everything this unit will teach.</p>
        <p>
          <a className="btn" href={href.unit(info.unit.id)}>
            Open unit {info.unit.number}: {info.unit.title}
          </a>
        </p>
      </main>
    );
  }

  if (loaded.state === "loading") return <main className="page page--narrow muted">Loading the lesson…</main>;
  if (loaded.state === "error" || !loaded.value) {
    return (
      <main className="page page--narrow">
        <p className="lead">This lesson could not be loaded.</p>
        <p className="muted">{loaded.state === "error" ? loaded.message : ""}</p>
      </main>
    );
  }
  // Lessons about servers and tools run on your own computer. They get a page without an editor.
  if (info.unit.runsIn === "computer") return <ComputerLesson key={lessonId} info={info} lesson={loaded.value} />;
  return <LessonView key={lessonId} info={info} lesson={loaded.value} />;
}

function LessonView({ info, lesson }: { info: LessonInfo; lesson: Lesson }) {
  useStoreVersion();
  const state = lessonState(info.id);
  const prefs = getPrefs();
  const next = lessonAfter(info);
  const previous = lessonBefore(info);

  const [files, setFilesState] = useState<Files>(() => ({ ...lesson.starter, ...(savedCode(info.id) ?? {}) }));
  const [touched, setTouched] = useState(false);
  const [checkResults, setCheckResults] = useState<boolean[]>([]);
  const [view, setView] = useState<"read" | "code">("read");
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  const setFiles = (nextFiles: Files) => {
    setFilesState(nextFiles);
    if (!touched) {
      setTouched(true);
      touchLesson(info.id);
    }
  };
  useDebouncedSave(files, (value) => saveCode(info.id, value), touched);

  /** Replaces the code in the editor and offers an undo. */
  const replaceCode = (nextFiles: Files, text: string) => {
    const before = files;
    setFiles({ ...nextFiles });
    setView("code");
    if (!isEmpty(before) && !sameFiles(before, nextFiles)) {
      setNotice({ text, action: { label: "Undo", run: () => setFiles(before) } });
    } else setNotice({ text });
  };

  // What the tutor is told about this lesson. The most important parts come first: long text is cut at the end.
  const tutorContext = useMemo(
    () =>
      asContext([
        lesson.intro,
        `The answer code of this lesson:\n${codeAsText(lesson.answer, lesson.fileOrder)}`,
        `The explanation of the answer:\n${lesson.explanation}`,
        lesson.twist && `The twist (a small change the learner makes alone):\n${lesson.twist}`,
        `The twist answer:\n${codeAsText(lesson.twistAnswer, lesson.fileOrder)}`,
        lesson.whatChanged && `What changed in the twist, and why:\n${lesson.whatChanged}`,
      ]),
    [lesson],
  );

  const hasStarter = !isEmpty(lesson.starter);
  const passed = lesson.checks.length > 0 && lesson.checks.every((_, i) => checkResults[i]);

  const finish = () => {
    setLessonState(info.id, "done");
    saveCode(info.id, files);
    go(next ? href.lesson(next.id) : href.project(info.unit.id));
  };

  const twistAnswer = (
    <>
      {lesson.twistAnswerProse ? <Markdown source={lesson.twistAnswerProse} /> : null}
      <CodeBox
        files={lesson.twistAnswer}
        fileOrder={lesson.fileOrder}
        label="Twist answer"
        compareTo={lesson.answer}
        actions={
          <button type="button" className="btn btn--small btn--quiet" onClick={() => replaceCode(lesson.twistAnswer, "The twist answer is in your editor.")}>
            Put it in my editor
          </button>
        }
      />
      <p className="small muted" style={{ marginTop: -6 }}>
        The marked lines are the ones that changed.
      </p>
      <Frame files={lesson.twistAnswer} label="Result of the twist answer" />
      {lesson.whatChanged ? (
        <>
          <h3 style={{ fontSize: 19, margin: "18px 0 8px" }}>What changed, and why</h3>
          <Markdown source={lesson.whatChanged} variant="explain" />
        </>
      ) : null}
    </>
  );

  return (
    <div className="lesson" data-view={view}>
      <div className="viewswitch" role="group" aria-label="What to show">
        <button type="button" aria-pressed={view === "read"} onClick={() => setView("read")}>
          Lesson
        </button>
        <button type="button" aria-pressed={view === "code"} onClick={() => setView("code")}>
          Your code
        </button>
      </div>

      <main className="lesson__pad">
        <TitleBlock
          title={lesson.title}
          meta={
            <>
              <a href={href.unit(info.unit.id)}>Unit {info.unit.number}</a>
              <span>
                Lesson {info.number} of {info.unit.lessons.length}
              </span>
              <span>About {lesson.minutes} minutes</span>
            </>
          }
          state={state === "done" ? { kind: "done", label: "Done" } : state === "skipped" ? { kind: "skipped", label: "Skipped" } : null}
        />

        {lesson.intro ? (
          <div className="lead" style={{ marginBottom: 4 }}>
            <Markdown source={lesson.intro} />
          </div>
        ) : null}

        <section className="step">
          <div className="step__head">
            <span className="step__num">1</span>
            <h2>Read the answer</h2>
          </div>
          {lesson.answerProse ? <Markdown source={lesson.answerProse} /> : null}
          <CodeBox files={lesson.answer} fileOrder={lesson.fileOrder} label="Answer" />
          <Frame files={lesson.answer} label="Result" />
        </section>

        <section className="step">
          <div className="step__head">
            <span className="step__num">2</span>
            <h2>Understand it</h2>
          </div>
          <Markdown source={lesson.explanation} variant="explain" />
        </section>

        <section className="step">
          <div className="step__head">
            <span className="step__num">3</span>
            <h2>Copy it</h2>
          </div>
          <div className="step__body">
            <p>
              {hasStarter
                ? "Your editor already has the parts you know from earlier lessons. Type the new part of the answer into it."
                : "Type the answer into your editor. Typing it yourself, line by line, is what makes it stick."}{" "}
              The result updates while you type.
            </p>
            <div className="row">
              <button type="button" className="btn" onClick={() => replaceCode(lesson.answer, "The answer is in your editor.")}>
                Paste the answer for me
              </button>
              {hasStarter ? (
                <button type="button" className="btn btn--quiet" onClick={() => replaceCode(lesson.starter, "Your editor is back at the start.")}>
                  Start over
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="step step--twist">
          <div className="step__head">
            <span className="step__num">4</span>
            <h2>Twist it</h2>
          </div>
          <div className="twisttask">
            <Markdown source={lesson.twist} />
          </div>
          {lesson.checks.length ? (
            <>
              <ul className="checks" aria-label="Checks for the twist">
                {lesson.checks.map((check, i) => (
                  <li key={i} data-ok={checkResults[i] ? "true" : "false"}>
                    <span className="checks__mark" aria-hidden="true" />
                    <span>
                      {check.label}
                      <span className="visually-hidden">{checkResults[i] ? " (done)" : " (not yet)"}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="checks__note">{passed ? "All checks pass. Your twist works." : "The boxes fill in by themselves while you type in your editor."}</p>
            </>
          ) : null}

          {prefs.foldTwist ? (
            <details>
              <summary className="btn btn--quiet" style={{ display: "inline-flex", marginBottom: 12 }}>
                Show the twist answer
              </summary>
              {twistAnswer}
            </details>
          ) : (
            twistAnswer
          )}
        </section>

        <div className="finish">
          <div className="row">
            {state === "done" ? (
              <>
                <a className="btn btn--primary" href={next ? href.lesson(next.id) : href.project(info.unit.id)}>
                  {next ? `Next lesson: ${next.title}` : `Unit project: ${info.unit.project.title}`}
                </a>
                <button type="button" className="btn btn--quiet" onClick={() => setLessonState(info.id, "started")}>
                  Mark as not done
                </button>
              </>
            ) : (
              <button type="button" className="btn btn--hi" onClick={finish}>
                Mark lesson done{next ? " and go to the next" : " and open the unit project"}
              </button>
            )}
          </div>
          <p className="finish__nav row">
            {previous ? <a href={href.lesson(previous.id)}>Back to lesson {previous.number}</a> : null}
            <a href={href.unit(info.unit.id)}>All lessons in this unit</a>
          </p>
        </div>
      </main>

      <aside className="lesson__bench" aria-label="Your code and its result">
        <Bench
          label="Your code"
          files={files}
          fileOrder={lesson.fileOrder}
          onChange={setFiles}
          checks={lesson.checks}
          onChecks={setCheckResults}
          placeholder="Type the answer here…"
        />
      </aside>

      <Tutor what="lesson" pageId={`lesson:${info.id}`} title={`Unit ${info.unit.number} (${info.unit.title}), lesson ${info.number}: ${lesson.title}`} context={tutorContext} files={files} fileOrder={lesson.fileOrder} />
      <Notice notice={notice} onClose={closeNotice} />
    </div>
  );
}
