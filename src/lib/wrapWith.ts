/**
 * Wrap with a tag: select text, press Alt+W, type a short form, press Enter.
 *
 *   Hello            + strong     ->  <strong>Hello</strong>
 *   Home             + a          ->  <a href="">Home</a>      (the cursor lands in href)
 *   two paragraphs   + div.card   ->  a div around them, with the lines moved in
 *   three lines      + ul>li*     ->  a list with one item for every line
 *
 * In VS Code this is "Emmet: Wrap with Abbreviation".
 */
import { EditorSelection, StateEffect, StateField, type Extension } from "@codemirror/state";
import { EditorView, keymap, showPanel, type Command, type Panel } from "@codemirror/view";
import expand from "emmet";
import { isAbbreviation } from "./editorKeys";

const setOpen = StateEffect.define<boolean>();

/** What will be wrapped: the selection, or the text of the line when nothing is selected. */
function target(view: EditorView): { from: number; to: number } | null {
  const range = view.state.selection.main;
  if (!range.empty) return { from: range.from, to: range.to };
  const line = view.state.doc.lineAt(range.head);
  const text = line.text;
  if (text.trim() === "") return null;
  const start = text.length - text.trimStart().length;
  return { from: line.from + start, to: line.from + text.trimEnd().length };
}

/** Builds the wrapped text. Returns null when the short form is not one. */
export function wrapText(abbreviation: string, selected: string, baseIndent = "", unit = "  "): string | null {
  const abbr = abbreviation.trim();
  // "ul>li*" (one item for every line) ends with a star, which a normal short form may not.
  if (!abbr || !isAbbreviation(abbr.replace(/\*$/, "")) || abbr === "!") return null;
  const lines = selected.split("\n");
  // The lines keep their shape: take away the indent they share, the wrapper adds its own.
  const shared = lines.slice(1).filter((l) => l.trim() !== "").reduce((min, l) => Math.min(min, l.length - l.trimStart().length), Infinity);
  const clean = lines.map((l, i) => (i === 0 ? l.trimStart() : l.slice(Number.isFinite(shared) ? shared : 0)).trimEnd());
  let out: string;
  try {
    out = expand(abbr, { type: "markup", syntax: "html", text: clean.length > 1 ? clean : clean[0] });
  } catch {
    return null;
  }
  if (!out || out === abbr) return null;
  return out
    .split("\n")
    .map((line, i) => {
      const tabs = /^\t*/.exec(line)?.[0].length ?? 0;
      const body = unit.repeat(tabs) + line.slice(tabs);
      return i === 0 || body === "" ? body : baseIndent + body;
    })
    .join("\n");
}

function apply(view: EditorView, abbreviation: string): boolean {
  const where = target(view);
  if (!where) return false;
  const { state } = view;
  const line = state.doc.lineAt(where.from);
  const baseIndent = /^\s*/.exec(line.text)?.[0] ?? "";
  const wrapped = wrapText(abbreviation, state.sliceDoc(where.from, where.to), baseIndent);
  if (!wrapped) return false;
  // An address that still has to be typed (href="") gets the cursor. Otherwise it goes to the end.
  const empty = wrapped.indexOf('=""');
  const cursor = where.from + (empty >= 0 ? empty + 2 : wrapped.length);
  view.dispatch({
    changes: { from: where.from, to: where.to, insert: wrapped },
    selection: EditorSelection.cursor(cursor),
    effects: setOpen.of(false),
    scrollIntoView: true,
    userEvent: "input.wrap",
  });
  view.focus();
  return true;
}

function panel(view: EditorView): Panel {
  const dom = document.createElement("div");
  dom.className = "cm-wrap-panel";
  const label = document.createElement("label");
  label.textContent = "Wrap with";
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "strong   a   div.card   ul>li*";
  input.spellcheck = false;
  input.autocapitalize = "off";
  input.setAttribute("aria-label", "Wrap the selection with this short form");
  label.append(input);
  const hint = document.createElement("span");
  hint.className = "cm-wrap-hint";
  const say = (text: string, problem = false) => {
    hint.textContent = text;
    hint.dataset.problem = problem ? "true" : "false";
  };
  say(target(view) ? "Enter wraps it. Esc cancels." : "Select the text to wrap first.", !target(view));
  const close = () => {
    view.dispatch({ effects: setOpen.of(false) });
    view.focus();
  };
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (!target(view)) say("Select the text to wrap first.", true);
      else if (!apply(view, input.value)) say(`"${input.value.trim()}" is not a short form. Try strong, a or div.card.`, true);
    }
  });
  dom.append(label, hint);
  return { dom, top: true, mount: () => input.focus() };
}

const open = StateField.define<boolean>({
  create: () => false,
  update(value, tr) {
    for (const effect of tr.effects) if (effect.is(setOpen)) value = effect.value;
    return value;
  },
  provide: (field) => showPanel.from(field, (on) => (on ? panel : null)),
});

/** Alt+W: ask what to wrap the selection with. */
export const openWrap: Command = (view) => {
  if (view.state.field(open, false)) {
    view.dom.querySelector<HTMLInputElement>(".cm-wrap-panel input")?.focus();
    return true;
  }
  view.dispatch({ effects: setOpen.of(true) });
  return true;
};

/** Wrap with a tag, for HTML files. */
export const wrapWith = (filename: string): Extension => (/\.html?$/i.test(filename) ? [open, keymap.of([{ key: "Alt-w", run: openWrap }])] : []);
