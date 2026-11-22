import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { syntaxHighlighting } from "@codemirror/language";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { keymap, placeholder as placeholderExtension } from "@codemirror/view";
import { EditorView, basicSetup } from "codemirror";
import { useEffect, useRef, type RefObject } from "react";
import { fastKeys } from "../lib/editorKeys";
import { canFormat, formatCode } from "../lib/format";
import { linkedTags } from "../lib/linkedTags";
import { pairMarks } from "../lib/pairMarks";
import { wrapWith } from "../lib/wrapWith";
import { useThemeState } from "../lib/theme";
import { highlighters } from "../lib/tokens";

const languageExtension = (filename: string): Extension => {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "css") return css();
  if (ext === "js" || ext === "mjs") return javascript();
  if (ext === "jsx") return javascript({ jsx: true });
  if (ext === "ts") return javascript({ typescript: true });
  if (ext === "tsx") return javascript({ jsx: true, typescript: true });
  return html();
};

export type FormatResult = "changed" | "same" | "failed";

/** What the buttons around the editor can ask it to do. */
export interface EditorApi {
  format: () => Promise<FormatResult>;
}

interface Props {
  filename: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Filled in while the editor is on the page. */
  api?: RefObject<EditorApi | null>;
}

/** Tidies the whole file. The cursor stays on its line. One Undo brings the old text back. */
async function formatView(view: EditorView, filename: string): Promise<FormatResult> {
  const before = view.state.doc.toString();
  let tidy: string;
  try {
    tidy = await formatCode(before, filename);
  } catch {
    return "failed";
  }
  // Typed something while the formatter was loading: leave the newer text alone.
  if (view.state.doc.toString() !== before) return "failed";
  if (tidy === before) return "same";
  const head = view.state.selection.main.head;
  const line = view.state.doc.lineAt(head);
  const column = head - line.from - (line.text.length - line.text.trimStart().length);
  const lines = tidy.split("\n");
  const row = Math.min(line.number, lines.length) - 1;
  const start = lines.slice(0, row).reduce((n, l) => n + l.length + 1, 0);
  const indent = lines[row].length - lines[row].trimStart().length;
  const cursor = start + Math.min(indent + Math.max(column, 0), lines[row].length);
  view.dispatch({ changes: { from: 0, to: before.length, insert: tidy }, selection: { anchor: cursor }, userEvent: "input.format", scrollIntoView: true });
  return "changed";
}

/** The code editor. One instance per file tab. Its colors come from the theme (CSS variables). */
export function CodeEditor({ filename, value, onChange, placeholder, api }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initial = useRef(value);
  initial.current = value;
  const { codeDark } = useThemeState();
  const darkRef = useRef(codeDark);
  darkRef.current = codeDark;
  const darkness = useRef(new Compartment());

  useEffect(() => {
    if (!host.current) return;
    const editor = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: initial.current,
        extensions: [
          basicSetup,
          fastKeys(filename),
          linkedTags(filename),
          pairMarks,
          wrapWith(filename),
          canFormat(filename)
            ? keymap.of([
                {
                  key: "Shift-Alt-f",
                  run: (target) => {
                    void formatView(target, filename);
                    return true;
                  },
                },
              ])
            : [],
          languageExtension(filename),
          ...highlighters.map((highlighter) => syntaxHighlighting(highlighter)),
          darkness.current.of(EditorView.darkTheme.of(darkRef.current)),
          // While text is selected the line highlight steps aside, or it would cover the selection on that line.
          EditorView.editorAttributes.compute(["selection"], (state) => ({ class: state.selection.ranges.some((range) => !range.empty) ? "cm-has-selection" : "" })),
          EditorView.lineWrapping,
          EditorState.tabSize.of(2),
          placeholder ? placeholderExtension(placeholder) : [],
          EditorView.contentAttributes.of({ "aria-label": `Code editor for ${filename}`, spellcheck: "false", autocapitalize: "off", autocorrect: "off" }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = editor;
    if (api) api.current = { format: () => formatView(editor, filename) };
    return () => {
      editor.destroy();
      view.current = null;
      if (api) api.current = null;
    };
  }, [filename, placeholder, api]);

  // The code was replaced from outside (for example "Paste the answer").
  useEffect(() => {
    const editor = view.current;
    if (!editor) return;
    const current = editor.state.doc.toString();
    if (current !== value) editor.dispatch({ changes: { from: 0, to: current.length, insert: value } });
  }, [value]);

  // A light or a dark code theme was chosen: the editor's own small parts (tooltips, folds) follow.
  useEffect(() => {
    view.current?.dispatch({ effects: darkness.current.reconfigure(EditorView.darkTheme.of(codeDark)) });
  }, [codeDark]);

  return <div ref={host} style={{ height: "100%" }} />;
}
