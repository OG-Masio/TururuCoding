import { useState } from "react";
import type { Files } from "../lib/lesson";
import { Preview } from "./Preview";

interface Props {
  files: Files;
  label: string;
  /** Tallest the frame may grow. */
  max?: number;
}

/** A result shown on the pad. It grows to fit the page inside it. */
export function Frame({ files, label, max = 440 }: Props) {
  const [height, setHeight] = useState(160);
  return (
    <div className="frame">
      <div className="frame__bar">{label}</div>
      <div style={{ height: Math.min(max, Math.max(90, height + 4)) }}>
        <Preview files={files} title={label} delay={0} onHeight={setHeight} />
      </div>
    </div>
  );
}
