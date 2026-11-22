import { useEffect, useRef, useState } from "react";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const mod = isMac ? "⌘" : "Ctrl";
const alt = isMac ? "Option" : "Alt";

const keys: { keys: string[]; does: string; example?: string }[] = [
  { keys: ["Tab"], does: "Jump over the closing tag, bracket or quote right after the cursor.", example: "you|</p>  →  you</p>|" },
  { keys: ["Tab"], does: "Expand a short form into full HTML. Tab again moves to the next empty spot, then out.", example: "p   a   ul>li*3   div.card   !" },
  { keys: ["!", "Enter"], does: "Start a whole empty page. A small list shows what you get, and Enter accepts it. The same works for every short form with a symbol in it. Esc closes the list.", example: "!   ul>li*3   div.card" },
  { keys: [alt, "W"], does: "Wrap the selected text in a tag. Type the tag, then Enter.", example: "Hello + strong  →  <strong>Hello</strong>" },
  { keys: ["Tab"], does: "In CSS: expand a short form into a full line. A small list shows what you get.", example: "m10   p10-20   fz18   c#333   df   bgc" },
  { keys: ["Shift", alt, "F"], does: "Format: fix the indentation of the whole file. The Format button does the same." },
  { keys: [mod, "Enter"], does: "Start a new line below, from anywhere in the line." },
  { keys: [mod, "Shift", "Enter"], does: "Start a new line above." },
  { keys: ["End"], does: "Go to the end of the line. Home goes to the start." },
  { keys: [alt, "↑ / ↓"], does: "Move the line up or down." },
  { keys: ["Shift", alt, "↓"], does: "Copy the line down." },
  { keys: [mod, "/"], does: "Turn the line into a comment, and back." },
  { keys: [mod, "D"], does: "Select the next place the same word appears, to change both at once." },
  { keys: ["type"], does: "Change the name of a tag, and its closing tag changes with it. Both names are underlined while they are linked." },
  { keys: ["click"], does: "Click next to a bracket, or in the name of a tag: boxes show the two parts that belong together. They go away when you type." },
  { keys: [mod, "Z"], does: `Undo. ${isMac ? "⌘ Shift Z" : "Ctrl Y"} brings it back.` },
  { keys: ["Tab"], does: "At the start of a line: indent. Shift Tab takes the indent away." },
  { keys: ["Esc", "Tab"], does: "Leave the editor with the keyboard: Esc first, then Tab." },
];

/** The "Keys" button in the editor bar, with the list of fast-typing keys. */
export function KeysHelp() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onClick = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={box} className="keyshelp">
      <button type="button" className="btn btn--small btn--onblue" aria-expanded={open} aria-controls="keys-panel" onClick={() => setOpen(!open)}>
        Keys
      </button>
      {open ? (
        <div id="keys-panel" className="keyshelp__panel" role="dialog" aria-label="Keys that make typing faster">
          <p className="keyshelp__title">Keys that make typing faster</p>
          <table>
            <tbody>
              {keys.map((row, i) => (
                <tr key={i}>
                  <th scope="row">
                    {row.keys.map((k, j) => (
                      <kbd key={j}>{k}</kbd>
                    ))}
                  </th>
                  <td>
                    {row.does}
                    {row.example ? <code className="keyshelp__example">{row.example}</code> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
