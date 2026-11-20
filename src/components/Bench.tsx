import { useState, type ReactNode } from "react";
import type { Check, Files } from "../lib/lesson";
import { CodeEditor } from "./CodeEditor";
import { KeysHelp } from "./KeysHelp";
import { Preview, type ConsoleEntry } from "./Preview";

type View = "split" | "code" | "result";

interface Props {
  label: string;
  files: Files;
  fileOrder: string[];
  onChange: (files: Files) => void;
  checks?: Check[];
  onChecks?: (results: boolean[]) => void;
  /** Buttons shown at the right of the editor bar. */
  actions?: ReactNode;
  placeholder?: string;
}

/** The workbench: your code in the code area, the result on the white sheet. */
export function Bench({ label, files, fileOrder, onChange, checks, onChecks, actions, placeholder }: Props) {
  const [active, setActive] = useState(fileOrder[0]);
  const [view, setView] = useState<View>("split");
  const [log, setLog] = useState<ConsoleEntry[]>([]);
  const current = fileOrder.includes(active) ? active : fileOrder[0];
  const empty = Object.values(files).every((text) => text.trim() === "");

  return (
    <div className="bench" data-view={view}>
      <div className="bench__bar">
        <span className="bench__label">{label}</span>
        <div className="bench__tabs" role="tablist" aria-label="Files">
          {fileOrder.map((name) => (
            <button key={name} role="tab" type="button" className="bench__tab" aria-selected={name === current} onClick={() => setActive(name)}>
              {name}
            </button>
          ))}
        </div>
        <div className="bench__actions">
          {actions}
          <KeysHelp />
        </div>
      </div>

      <div className="bench__editor">
        <CodeEditor key={current} filename={current} value={files[current] ?? ""} onChange={(value) => onChange({ ...files, [current]: value })} placeholder={placeholder} />
      </div>

      <div className="bench__bar bench__bar--result">
        <span className="bench__label">Result</span>
        <div className="bench__actions">
          <button type="button" className="btn btn--small btn--onblue" aria-pressed={view === "code"} onClick={() => setView(view === "code" ? "split" : "code")}>
            Bigger code
          </button>
          <button type="button" className="btn btn--small btn--onblue" aria-pressed={view === "result"} onClick={() => setView(view === "result" ? "split" : "result")}>
            Bigger result
          </button>
        </div>
      </div>

      <div className="bench__result">
        <Preview files={files} title="Result of your code" checks={checks} onChecks={onChecks} onConsole={setLog} />
        {empty ? <div className="bench__empty">Your page shows up here as soon as you type.</div> : null}
      </div>

      {log.length > 0 ? (
        <div className="console" role="log" aria-label="Console output">
          <div className="console__head">
            <span>Console</span>
            <span>{log.some((l) => l.level === "error") ? "There is an error. Read the red line." : `${log.length} ${log.length === 1 ? "line" : "lines"}`}</span>
          </div>
          {log.map((entry, i) => (
            <div key={i} className="console__line" data-level={entry.level}>
              {entry.text}
            </div>
          ))}
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
