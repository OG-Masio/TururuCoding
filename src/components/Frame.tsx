import { useState } from "react";
import type { Files } from "../lib/lesson";
import { dependsOnWidth } from "../lib/screens";
import { Preview } from "./Preview";
import { Screen, ScreenSwitch } from "./Screen";

interface Props {
  files: Files;
  label: string;
  /** Tallest the frame may grow. */
  max?: number;
}

/** A result shown on the pad. It grows to fit the page inside it. */
export function Frame({ files, label, max = 440 }: Props) {
  const [height, setHeight] = useState(160);
  const [screen, setScreen] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  return (
    <div className="frame">
      <div className="frame__bar">
        <span>{label}</span>
        {/* Only code that looks different on a phone gets the width buttons. */}
        {dependsOnWidth(files) ? <ScreenSwitch value={screen} onChange={setScreen} /> : null}
      </div>
      <div style={{ height: Math.min(max, Math.max(90, height * scale + 4)) }}>
        <Screen width={screen} onScale={setScale}>
          <Preview files={files} title={label} delay={0} onHeight={setHeight} />
        </Screen>
      </div>
    </div>
  );
}
