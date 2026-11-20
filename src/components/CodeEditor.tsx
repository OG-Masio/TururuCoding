import { indentWithTab } from "@codemirror/commands";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { syntaxHighlighting } from "@codemirror/language";
import { EditorState, type Extension } from "@codemirror/state";
import { keymap, placeholder as placeholderExtension } from "@codemirror/view";
import { classHighlighter } from "@lezer/highlight";
import { EditorView, basicSetup } from "codemirror";
import { useEffect, useRef } from "react";

const languageExtension = (filename: string): Extension => {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "css") return css();
  if (ext === "js" || ext === "mjs") return javascript();
  if (ext === "jsx") return javascript({ jsx: true });
  if (ext === "ts") return javascript({ typescript: true });
  if (ext === "tsx") return javascript({ jsx: true, typescript: true });
  return html();
};

interface Props {
  filename: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** The code editor. One instance per file tab. */
export function CodeEditor({ filename, value, onChange, placeholder }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initial = useRef(value);
  initial.current = value;

  useEffect(() => {
    if (!host.current) return;
    const editor = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: initial.current,
        extensions: [
          basicSetup,
          keymap.of([indentWithTab]),
          languageExtension(filename),
          syntaxHighlighting(classHighlighter),
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
    return () => {
      editor.destroy();
      view.current = null;
    };
  }, [filename, placeholder]);

  // The code was replaced from outside (for example "Paste the answer").
  useEffect(() => {
    const editor = view.current;
    if (!editor) return;
    const current = editor.state.doc.toString();
    if (current !== value) editor.dispatch({ changes: { from: 0, to: current.length, insert: value } });
  }, [value]);

  return <div ref={host} style={{ height: "100%" }} />;
}
