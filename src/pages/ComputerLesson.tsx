import { useMemo } from "react";
import { CodeBox } from "../components/CodeBox";
import { Markdown } from "../components/Markdown";
import { TitleBlock } from "../components/TitleBlock";
import { Tutor } from "../components/Tutor";
import { lessonAfter, lessonBefore, type LessonInfo } from "../lib/course";
import type { Lesson } from "../lib/lesson";
import { go, href } from "../lib/router";
import { getPrefs, lessonState, lessonTicks, setLessonState, toggleLessonTick, touchLesson, useStoreVersion } from "../lib/store";
import { asContext, codeAsText } from "../lib/tutor";

const noFiles = {};
const noOrder: string[] = [];

/**
 * A lesson whose code runs on your own computer (a server, a tool, a deploy).
 * The same four steps as every lesson. There is no editor on the page: you type
 * in your own editor, run the code in your terminal, and tick what you see.
 */
export function ComputerLesson({ info, lesson }: { info: LessonInfo; lesson: Lesson }) {
  useStoreVersion();
  const state = lessonState(info.id);
  const ticks = lessonTicks(info.id);
  const prefs = getPrefs();
  const next = lessonAfter(info);
  const previous = lessonBefore(info);
  const allTicked = lesson.selfChecks.length > 0 && lesson.selfChecks.every((_, i) => ticks.includes(i));

  const tutorContext = useMemo(
    () =>
      asContext([
        "This lesson runs on the learner's own computer, in their own editor and terminal. There is no editor on the page.",
        lesson.intro,
        `The answer code of this lesson:\n${codeAsText(lesson.answer, lesson.fileOrder)}`,
        `The explanation of the answer:\n${lesson.explanation}`,
        lesson.runIt && `How to run it:\n${lesson.runIt}`,
        lesson.twist && `The twist (a small change the learner makes alone):\n${lesson.twist}`,
        lesson.whatChanged && `What changed in the twist, and why:\n${lesson.whatChanged}`,
      ]),
    [lesson],
  );

  const finish = () => {
    setLessonState(info.id, "done");
    go(next ? href.lesson(next.id) : href.project(info.unit.id));
  };

  const twistAnswer = (
    <>
      {lesson.twistAnswerProse ? <Markdown source={lesson.twistAnswerProse} /> : null}
      <CodeBox files={lesson.twistAnswer} fileOrder={lesson.fileOrder} label="Twist answer" compareTo={lesson.answer} />
      <p className="small muted" style={{ marginTop: -6 }}>
        The marked lines are the ones that changed.
      </p>
      {lesson.whatChanged ? (
        <>
          <h3 style={{ fontSize: 19, margin: "18px 0 8px" }}>What changed, and why</h3>
          <Markdown source={lesson.whatChanged} variant="explain" />
        </>
      ) : null}
    </>
  );

  return (
    <div className="lesson lesson--computer">
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
              <span>On your computer</span>
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
            <h2>Copy it and run it</h2>
          </div>
          <div className="step__body">
            <p>This lesson runs on your computer. Type the answer into your own editor, file by file. The Copy button on a file is there when you are short on time.</p>
          </div>
          <Markdown source={lesson.runIt} />
        </section>

        <section className="step step--twist">
          <div className="step__head">
            <span className="step__num">4</span>
            <h2>Twist it</h2>
          </div>
          <div className="twisttask">
            <Markdown source={lesson.twist} />
          </div>
          {lesson.selfChecks.length ? (
            <>
              <ul className="checks checks--self" aria-label="Check yourself">
                {lesson.selfChecks.map((text, i) => (
                  <li key={i}>
                    <label>
                      <input
                        type="checkbox"
                        checked={ticks.includes(i)}
                        onChange={() => {
                          touchLesson(info.id);
                          toggleLessonTick(info.id, i);
                        }}
                      />
                      <Markdown source={text} />
                    </label>
                  </li>
                ))}
              </ul>
              <p className="checks__note">{allTicked ? "Everything ticked. Your twist works." : "The site cannot see your computer. Tick each box when you see it yourself."}</p>
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

      <Tutor what="lesson" pageId={`lesson:${info.id}`} title={`Unit ${info.unit.number} (${info.unit.title}), lesson ${info.number}: ${lesson.title}`} context={tutorContext} files={noFiles} fileOrder={noOrder} />
    </div>
  );
}
