import type { ReactNode } from "react";

interface Props {
  title: string;
  /** The ruled boxes above the title. */
  meta: ReactNode;
  state?: { kind: "done" | "skipped"; label: string } | null;
}

/** The header of a page, drawn like the title block of an engineering pad. */
export function TitleBlock({ title, meta, state }: Props) {
  return (
    <header className="titleblock">
      <div className="titleblock__meta">
        {meta}
        {state ? (
          <span className="titleblock__state" data-state={state.kind}>
            {state.label}
          </span>
        ) : null}
      </div>
      <h1>{title}</h1>
    </header>
  );
}
