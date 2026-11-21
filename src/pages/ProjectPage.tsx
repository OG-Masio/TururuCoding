import { useCallback, useMemo, useState } from "react";
import { Bench } from "../components/Bench";
import { CodeBox } from "../components/CodeBox";
import { Frame } from "../components/Frame";
import { Markdown } from "../components/Markdown";
import { Notice, type NoticeData } from "../components/Notice";
import { TitleBlock } from "../components/TitleBlock";
import { Tutor } from "../components/Tutor";
import { findUnit, loadProjectDoc, units, type Unit } from "../lib/course";
import { download } from "../lib/download";
import { useDebouncedSave, useLoaded, useScrollTop, useTitle } from "../lib/hooks";
import { toProject, type Files, type Project } from "../lib/lesson";
import { buildStandalone } from "../lib/preview";
import { href } from "../lib/router";
import { asContext, codeAsText } from "../lib/tutor";
import { saveCode, savedCode, store, useStoreVersion, type ProjectRecord } from "../lib/store";
import { Missing } from "./Missing";

export function ProjectPage({ unitId }: { unitId: string }) {
  const unit = findUnit(unitId);
  useScrollTop(`project-${unitId}`);
  useTitle(unit ? `Project: ${unit.project.title}` : null);
  const loaded = useLoaded(async () => (unit && unit.ready ? toProject(await loadProjectDoc(unit)) : null), `project-${unitId}`);
  if (!unit) return <Missing what="project" />;

  if (!unit.ready) {
    return (
      <main className="page page--narrow">
        <TitleBlock
          title={unit.project.title}
          meta={
            <>
              <a href={href.unit(unit.id)}>Unit {unit.number}</a>
              <span>Unit project</span>
            </>
          }
        />
        <p className="lead">{unit.project.summary}</p>
        <div className="callout callout--quiet">
          <p>
            <strong>This project is planned, not written yet.</strong> It is written together with the lessons of unit {unit.number}.
          </p>
        </div>
        <p>
          <a href={href.unit(unit.id)}>Back to the unit</a>
        </p>
      </main>
    );
  }

  if (loaded.state === "loading") return <main className="page page--narrow muted">Loading the project…</main>;
  if (loaded.state === "error" || !loaded.value) {
    return (
      <main className="page page--narrow">
        <p className="lead">This project could not be loaded.</p>
        <p className="muted">{loaded.state === "error" ? loaded.message : ""}</p>
      </main>
    );
  }
  return <ProjectView key={unitId} unit={unit} project={loaded.value} />;
}

function ProjectView({ unit, project }: { unit: Unit; project: Project }) {
  useStoreVersion();
  const id = unit.project.id;
  const record = store.get<ProjectRecord>(`project:${id}`) ?? { s: "started" as const, steps: [], at: 0 };
  const [files, setFilesState] = useState<Files>(() => ({ ...project.starter, ...(savedCode(id) ?? {}) }));
  const [touched, setTouched] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [view, setView] = useState<"read" | "code">("read");
  const [url, setUrl] = useState(record.url ?? "");
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  const update = (patch: Partial<ProjectRecord>) => store.set(`project:${id}`, { ...record, ...patch, at: Date.now() } satisfies ProjectRecord);

  const setFiles = (next: Files) => {
    setFilesState(next);
    if (!touched) {
      setTouched(true);
      if (!record.at) update({});
    }
  };
  useDebouncedSave(files, (value) => saveCode(id, value), touched);

  const toggleStep = (index: number) => {
    const steps = record.steps.includes(index) ? record.steps.filter((n) => n !== index) : [...record.steps, index].sort((a, b) => a - b);
    update({ steps });
  };

  const tutorContext = useMemo(
    () =>
      asContext([
        "This is the unit project: a small page that uses every lesson of the unit. The learner builds it step by step.",
        project.intro,
        ...project.steps.map((step, i) => `Step ${i + 1}: ${step.title}\n${step.body}`),
        project.makeItYours && `Make it yours:\n${project.makeItYours}`,
        `The finished example:\n${codeAsText(project.result, project.fileOrder)}`,
      ]),
    [project],
  );

  const nextUnit = units[unit.number];
  const done = record.s === "done";
  const passedCount = project.checks.filter((_, i) => results[i]).length;

  return (
    <div className="lesson" data-view={view}>
      <div className="viewswitch" role="group" aria-label="What to show">
        <button type="button" aria-pressed={view === "read"} onClick={() => setView("read")}>
          Project
        </button>
        <button type="button" aria-pressed={view === "code"} onClick={() => setView("code")}>
          Your code
        </button>
      </div>

      <main className="lesson__pad">
        <TitleBlock
          title={project.title}
          meta={
            <>
              <a href={href.unit(unit.id)}>Unit {unit.number}</a>
              <span>Unit project</span>
              <span>About {project.minutes} minutes</span>
            </>
          }
          state={done ? { kind: "done", label: "Done" } : null}
        />
        <div className="lead">
          <Markdown source={project.intro} />
        </div>

        <section className="step">
          <div className="step__head">
            <span className="step__num">1</span>
            <h2>See the finished example</h2>
          </div>
          <Frame files={project.result} label="What you will build" max={520} />
          <CodeBox
            files={project.result}
            fileOrder={project.fileOrder}
            label="Finished example"
            actions={
              <button
                type="button"
                className="btn btn--small btn--quiet"
                onClick={() => {
                  const before = files;
                  setFiles({ ...project.result });
                  setView("code");
                  setNotice({ text: "The finished example is in your editor.", action: { label: "Undo", run: () => setFiles(before) } });
                }}
              >
                Put it in my editor
              </button>
            }
          />
        </section>

        <section className="step">
          <div className="step__head">
            <span className="step__num">2</span>
            <h2>Build it step by step</h2>
          </div>
          <p className="step__body">
            Each step shows the code to add and explains it. Type it into your editor, look at the result, then tick the step.{" "}
            <span className="muted">
              {record.steps.length} of {project.steps.length} steps ticked.
            </span>
          </p>
          {project.steps.map((step, index) => {
            const ticked = record.steps.includes(index);
            return (
              <div key={index} className="pstep" data-done={ticked ? "true" : "false"}>
                <label className="pstep__head">
                  <input type="checkbox" checked={ticked} onChange={() => toggleStep(index)} />
                  <h3>{step.title}</h3>
                </label>
                <Markdown source={step.body} variant="explain" />
              </div>
            );
          })}
        </section>

        {project.checks.length ? (
          <section className="step">
            <div className="step__head">
              <span className="step__num">3</span>
              <h2>Check your page</h2>
            </div>
            <ul className="checks" aria-label="Checks for the project">
              {project.checks.map((item, i) => (
                <li key={i} data-ok={results[i] ? "true" : "false"}>
                  <span className="checks__mark" aria-hidden="true" />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <p className="checks__note">
              {passedCount} of {project.checks.length} checks pass. They look at the code in your editor.
            </p>
          </section>
        ) : null}

        {project.makeItYours ? (
          <section className="step step--twist">
            <div className="step__head">
              <span className="step__num">{project.checks.length ? 4 : 3}</span>
              <h2>Twist it: make it yours</h2>
            </div>
            <div className="twisttask">
              <Markdown source={project.makeItYours} />
            </div>
          </section>
        ) : null}

        <section className="step">
          <div className="step__head">
            <span className="step__num">{(project.checks.length ? 4 : 3) + (project.makeItYours ? 1 : 0)}</span>
            <h2>Keep it</h2>
          </div>
          {project.onYourComputer ? <Markdown source={project.onYourComputer} /> : null}
          <div className="row" style={{ margin: "12px 0 18px" }}>
            <button type="button" className="btn" onClick={() => download("index.html", buildStandalone(files), "text/html")}>
              Download my page as index.html
            </button>
          </div>
          <div className="field">
            <label htmlFor="project-url">Where is it online? (optional)</label>
            <input
              id="project-url"
              type="url"
              inputMode="url"
              placeholder="https://"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => {
                if ((record.url ?? "") !== url.trim()) update({ url: url.trim() || undefined });
              }}
            />
            <p className="field__help">If you publish this project later, paste its address here. It then shows up on your My work page.</p>
          </div>
        </section>

        <div className="finish">
          <div className="row">
            {done ? (
              <>
                {nextUnit ? (
                  <a className="btn btn--primary" href={href.unit(nextUnit.id)}>
                    Next unit: {nextUnit.title}
                  </a>
                ) : (
                  <a className="btn btn--primary" href={href.map()}>
                    Back to the map
                  </a>
                )}
                <button type="button" className="btn btn--quiet" onClick={() => update({ s: "started" })}>
                  Mark as not done
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn--hi"
                onClick={() => {
                  saveCode(id, files);
                  update({ s: "done" });
                  setNotice({ text: `Project done. Unit ${unit.number} is finished.` });
                }}
              >
                Mark project done
              </button>
            )}
          </div>
          <p className="finish__nav row">
            <a href={href.unit(unit.id)}>All lessons in this unit</a>
            <a href={href.work()}>My work</a>
          </p>
        </div>
      </main>

      <aside className="lesson__bench" aria-label="Your code and its result">
        <Bench label="Your code" files={files} fileOrder={project.fileOrder} onChange={setFiles} checks={project.checks} onChecks={setResults} placeholder="Build your page here…" />
      </aside>
      <Tutor what="project" pageId={`project:${unit.id}`} title={`Project of unit ${unit.number}: ${project.title}`} context={tutorContext} files={files} fileOrder={project.fileOrder} />
      <Notice notice={notice} onClose={closeNotice} />
    </div>
  );
}
