import { useEffect, useRef, useState, type ReactNode } from "react";
import { SCREENS, fitScreen } from "../lib/screens";

interface SwitchProps {
  /** The chosen width in pixels. null: as wide as the place the result is in. */
  value: number | null;
  onChange: (width: number | null) => void;
  /** The buttons sit on the dark bar of the workbench. */
  onBlue?: boolean;
}

/** Phone, Tablet, Desktop. Press the chosen one again to go back to the normal width. */
export function ScreenSwitch({ value, onChange, onBlue }: SwitchProps) {
  return (
    <div className="screens" role="group" aria-label="Width of the result">
      {SCREENS.map((screen) => (
        <button
          key={screen.id}
          type="button"
          className={`btn btn--small${onBlue ? " btn--onblue" : ""}`}
          aria-pressed={value === screen.width}
          title={value === screen.width ? "Back to the normal width" : `Show the result ${screen.width} pixels wide`}
          onClick={() => onChange(value === screen.width ? null : screen.width)}
        >
          {screen.label}
        </button>
      ))}
    </div>
  );
}

interface ScreenProps {
  width: number | null;
  children: ReactNode;
  /** Reports how much smaller the page is shown: 1 is real size. */
  onScale?: (scale: number) => void;
}

/** Shows what is inside at a fixed width. It fills its parent. */
export function Screen({ width, children, onScale }: ScreenProps) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const read = () => setSize((old) => (old.width === element.clientWidth && old.height === element.clientHeight ? old : { width: element.clientWidth, height: element.clientHeight }));
    read();
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const fit = width ? fitScreen(width, size) : null;
  const scale = fit?.scale ?? 1;
  const report = useRef(onScale);
  report.current = onScale;
  useEffect(() => report.current?.(scale), [scale]);

  return (
    <div ref={box} className="screen" data-fixed={width ? "true" : undefined}>
      <div className="screen__page" style={fit && width ? { width, height: fit.height, left: fit.left, transform: fit.scale < 1 ? `scale(${fit.scale})` : undefined } : undefined}>
        {children}
      </div>
    </div>
  );
}
