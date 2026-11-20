import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import Markdown from '../components/Markdown';
import { findLesson, neighbours, type Lesson, type LessonFile } from '../lib/lessons';
import { buildPreview, readSandboxStorage, writeSandboxStorage } from '../lib/preview';
import { getLesson, saveCode, setCompleted, useProgress } from '../lib/progress';
import { downloadStarter } from '../lib/starter';

export default function LessonPage() {
  const { moduleId, slug } = useParams();
  const lesson = findLesson(`${moduleId}/${slug}`);
  if (!lesson) return <main className="page"><p>Lesson not found. <Link to="/">Go home</Link></p></main>;
  return <LessonView key={lesson.id} lesson={lesson} />;
}

function LessonView({ lesson }: { lesson: Lesson }) {
  const progress = useProgress();
  const [files, setFiles] = useState<LessonFile[]>(() => getLesson(lesson.id)?.files ?? lesson.answer);
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState<'learn' | 'twist'>('learn');
  const [showTwistAnswer, setShowTwistAnswer] = useState(false);
  const [preview, setPreview] = useState(() => buildPreview(lesson.mode, files, readSandboxStorage(lesson.id)));
  const [runKey, setRunKey] = useState(0);
  const [logs, setLogs] = useState<{ level: string; text: string }[]>([]);
  const frame = useRef<HTMLIFrameElement>(null);

  // console.log output from the preview shows up in the Console panel.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      if (e.data?.tururu === 'storage') return writeSandboxStorage(lesson.id, e.data.data);
      if (e.data?.tururu !== 'console') return;
      setLogs((l) => [...l.slice(-199), { level: String(e.data.level), text: String(e.data.text) }]);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [lesson.id]);
  useEffect(() => setLogs([]), [preview, runKey]);
  const { prev, next } = neighbours(lesson.id);
  const completed = !!progress[lesson.id]?.completed;
  const changed = useMemo(() => JSON.stringify(files) !== JSON.stringify(lesson.answer), [files, lesson.answer]);

  // Live preview: rebuild shortly after you stop typing.
  useEffect(() => {
    const t = setTimeout(() => setPreview(buildPreview(lesson.mode, files, readSandboxStorage(lesson.id))), 400);
    return () => clearTimeout(t);
  }, [files, lesson.mode]);

  // On a new device, saved code can arrive from the server a moment after the page opens.
  // Show it, unless you've already started typing here.
  const edited = useRef(false);
  const savedFiles = progress[lesson.id]?.files;
  useEffect(() => {
    if (!edited.current && savedFiles) setFiles(savedFiles);
  }, [savedFiles]);

  const edit = (code: string) => {
    edited.current = true;
    const nextFiles = files.map((f, i) => (i === active ? { ...f, code } : f));
    setFiles(nextFiles);
    saveCode(lesson.id, nextFiles);
  };
  const load = (fs: LessonFile[]) => {
    edited.current = true;
    const copy = fs.map((f) => ({ ...f }));
    setFiles(copy);
    setActive(0);
    saveCode(lesson.id, copy);
  };

  const file = files[active];

  return (
    <main className="lesson">
      <section className="lesson-text">
        <nav className="crumbs">
          <Link to="/">All lessons</Link>
          {lesson.capstone && <span className="tag">Capstone</span>}
        </nav>
        <h1>{lesson.title}</h1>
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'learn'} className={tab === 'learn' ? 'on' : ''} onClick={() => setTab('learn')}>1. The answer</button>
          <button role="tab" aria-selected={tab === 'twist'} className={tab === 'twist' ? 'on' : ''} onClick={() => setTab('twist')}>2. Your twist</button>
        </div>
        {tab === 'learn' ? (
          <>
            <Markdown text={lesson.explanation} />
            <button className="btn primary" onClick={() => setTab('twist')}>Got it, show me the twist</button>
          </>
        ) : (
          <>
            <Markdown text={lesson.twist || 'Change anything you like in the code and watch the preview.'} />
            {lesson.twistAnswer.length > 0 && (
              <div className="twist-answer">
                {!showTwistAnswer ? (
                  <button className="btn" onClick={() => setShowTwistAnswer(true)}>Show the twist answer</button>
                ) : (
                  <>
                    {lesson.twistAnswer.map((f) => (
                      <div key={f.name}>
                        <div className="file-label">{f.name}</div>
                        <pre><code>{f.code}</code></pre>
                      </div>
                    ))}
                    <button className="btn" onClick={() => load(lesson.twistFull)}>Put the twist answer in the editor</button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        <div className="lesson-actions">
          <button className={'btn ' + (completed ? 'done' : 'primary')} onClick={() => setCompleted(lesson.id, !completed)}>
            {completed ? '✓ Done' : 'Mark as done'}
          </button>
          <button className="btn" onClick={() => downloadStarter(lesson, files)}>Download for VS Code</button>
        </div>
        <div className="prevnext">
          {prev ? <Link to={`/lesson/${prev.id}`}>← {prev.title}</Link> : <span />}
          {next && <Link to={`/lesson/${next.id}`}>{next.title} →</Link>}
        </div>
      </section>

      <section className="workspace">
        <div className="editor-pane">
          <div className="file-tabs">
            {files.map((f, i) => (
              <button key={f.name} className={i === active ? 'on' : ''} onClick={() => setActive(i)}>{f.name}</button>
            ))}
            <span className="spacer" />
            {changed && <button className="btn ghost small" onClick={() => load(lesson.answer)} title="Go back to the original answer">Reset</button>}
          </div>
          <div className="editor-body">
            {file ? <CodeEditor name={file.name} value={file.code} onChange={edit} /> : <p className="muted pad">This lesson has no code.</p>}
          </div>
        </div>
        <div className="preview-pane">
          <div className="preview-bar">
            <span>Preview</span>
            <span className="spacer" />
            <button className="btn ghost small" onClick={() => { setPreview(buildPreview(lesson.mode, files, readSandboxStorage(lesson.id))); setRunKey((k) => k + 1); }}>Run again</button>
          </div>
          <iframe ref={frame} key={runKey} title="Preview" srcDoc={preview} sandbox="allow-scripts allow-modals allow-forms allow-popups" />
          {(logs.length > 0 || lesson.mode !== 'code') && (
            <div className={'console' + (logs.length ? ' has-logs' : '')}>
              <div className="console-bar">
                <span>Console {logs.length > 0 && `(${logs.length})`}</span>
                <span className="spacer" />
                {logs.length > 0 && <button className="btn ghost small" onClick={() => setLogs([])}>Clear</button>}
              </div>
              {logs.length > 0 && (
                <div className="console-body">
                  {logs.map((l, i) => (
                    <pre key={i} className={'log-' + l.level}>{l.text}</pre>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
