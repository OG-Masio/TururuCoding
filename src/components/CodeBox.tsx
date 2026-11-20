import { useMemo, useState, type ReactNode } from "react";
import { highlightLines } from "../lib/highlight";
import { changedLines, type Files } from "../lib/lesson";

interface Props {
  files: Files;
  fileOrder: string[];
  /** Shown next to the file names, for example "Answer". */
  label?: string;
  /** When given, lines that differ from these files are marked. */
  compareTo?: Files;
  actions?: ReactNode;
}

/** A boxed, read-only piece of code: the answer. */
export function CodeBox({ files, fileOrder, label, compareTo, actions }: Props) {
  const names = fileOrder.filter((name) => name in files);
  const [active, setActive] = useState(() => {
    // Open on the file that changed, when only one did.
    if (compareTo) {
      const changed = names.filter((n) => (compareTo[n] ?? "") !== files[n]);
      if (changed.length) return changed[0];
    }
    return names[0];
  });
  const current = names.includes(active) ? active : names[0];
  const code = files[current] ?? "";
  const lines = useMemo(() => highlightLines(code, current), [code, current]);
  const marks = useMemo(() => (compareTo ? changedLines(compareTo[current] ?? "", code.replace(/\n$/, "")) : null), [compareTo, current, code]);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* the browser refused; the code can still be selected by hand */
    }
  };

  return (
    <div className="codebox">
      <div className="codebox__bar">
        {names.length > 1 ? (
          <div role="tablist" aria-label="Files" style={{ display: "flex", alignSelf: "stretch" }}>
            {names.map((name) => (
              <button key={name} type="button" role="tab" className="codebox__file" aria-selected={name === current} onClick={() => setActive(name)}>
                {name}
              </button>
            ))}
          </div>
        ) : (
          <span className="codebox__file">{current}</span>
        )}
        {label ? <span className="codebox__label">{label}</span> : null}
        <div className="codebox__actions">
          {actions}
          <button type="button" className="btn btn--small btn--quiet" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <pre tabIndex={0} aria-label={`${label ?? "Code"}: ${current}`}>
        <code>
          {lines.map((line, i) => (
            <span key={i} className="codebox__line" data-changed={marks?.[i] ? "true" : undefined} dangerouslySetInnerHTML={{ __html: line || " " }} />
          ))}
        </code>
      </pre>
    </div>
  );
}
