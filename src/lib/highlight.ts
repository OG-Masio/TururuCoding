/**
 * Colors code that is shown on the page (the answer boxes), using the same
 * parsers as the editor, so both look the same.
 */
import { cssLanguage } from "@codemirror/lang-css";
import { htmlLanguage } from "@codemirror/lang-html";
import { javascriptLanguage, jsxLanguage, tsxLanguage, typescriptLanguage } from "@codemirror/lang-javascript";
import type { Language } from "@codemirror/language";
import { classHighlighter, highlightTree } from "@lezer/highlight";

export const languageFor = (fileOrLang: string): Language | null => {
  const key = fileOrLang.toLowerCase().split(".").pop() ?? "";
  switch (key) {
    case "html":
    case "htm":
      return htmlLanguage;
    case "css":
      return cssLanguage;
    case "js":
    case "mjs":
    case "javascript":
      return javascriptLanguage;
    case "jsx":
      return jsxLanguage;
    case "ts":
    case "typescript":
      return typescriptLanguage;
    case "tsx":
      return tsxLanguage;
    default:
      return null;
  }
};

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Returns HTML with <span class="tok-…"> around each colored piece. */
export function highlight(code: string, fileOrLang: string): string {
  const language = languageFor(fileOrLang);
  if (!language) return escapeHtml(code);
  let out = "";
  let pos = 0;
  try {
    const tree = language.parser.parse(code);
    highlightTree(tree, classHighlighter, (from, to, classes) => {
      if (from > pos) out += escapeHtml(code.slice(pos, from));
      out += `<span class="${classes}">${escapeHtml(code.slice(from, to))}</span>`;
      pos = to;
    });
  } catch {
    return escapeHtml(code);
  }
  return out + escapeHtml(code.slice(pos));
}

/** The same, one string per line, so single lines can be marked. */
export function highlightLines(code: string, fileOrLang: string): string[] {
  const html = highlight(code.replace(/\n$/, ""), fileOrLang);
  // A colored span can cross a line break (a multi-line comment). Close and reopen it.
  const lines: string[] = [];
  let open: string[] = [];
  let current = "";
  const re = /<span class="([^"]*)">|<\/span>|\n|[^<\n]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const piece = m[0];
    if (piece === "\n") {
      lines.push(current + "</span>".repeat(open.length));
      current = open.map((c) => `<span class="${c}">`).join("");
    } else if (piece === "</span>") {
      open = open.slice(0, -1);
      current += piece;
    } else if (m[1] !== undefined) {
      open = [...open, m[1]];
      current += piece;
    } else current += piece;
  }
  lines.push(current);
  return lines;
}
