/**
 * Keys that make typing HTML faster, the way VS Code does it.
 *
 *   Tab            expands a short form (Emmet): "p" becomes <p></p>, "ul>li*3" a whole list
 *   Tab            jumps over a closing tag, bracket or quote that is right after the cursor
 *   Tab            otherwise indents the line (Shift+Tab takes the indent away)
 *   Ctrl+Shift+Enter   opens a new line above
 *
 * Ctrl+Enter (a new line below, from anywhere in the line) and the keys for
 * moving and copying lines already come with the editor.
 */
import { acceptCompletion, completionStatus, snippet } from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { syntaxTree } from "@codemirror/language";
import { EditorSelection, type EditorState } from "@codemirror/state";
import type { Command, KeyBinding } from "@codemirror/view";
import expand, { extract } from "emmet";

const HTML_TAGS = new Set(
  (
    "a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt " +
    "em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter " +
    "nav noscript object ol optgroup option output p picture pre progress q rp rt ruby s samp script search section select slot small source span strong style sub summary sup " +
    "svg table tbody td template textarea tfoot th thead time title tr track u ul var video wbr " +
    // short names Emmet knows
    "bq btn inp opt tarea sel sect art hdr ftr mn str leg fig figc pic ifr emb obj cap colg fst optg dlg tem adr dat prog src lorem doc"
  ).split(" "),
);

/** A short form that is only a tag name, like "p" or "ul", with nothing else. */
export const isBareWord = (text: string) => /^[A-Za-z][\w-]*$/.test(text);

/** Is this short form meant as one? Plain words in a sentence must not turn into tags. */
export function isAbbreviation(text: string): boolean {
  if (text === "!" || text === "!!!") return true;
  if (/^lorem\d*$/.test(text)) return true;
  const name = /^[A-Za-z][\w-]*/.exec(text)?.[0];
  if (name) {
    // Short forms are typed in small letters. "Link" or "Menu" is a word, not a tag.
    if (name !== name.toLowerCase() || !HTML_TAGS.has(name)) return false;
    // "p", "p.note", "ul>li*3", "a:link" … but not "p," or "a/b"
    return /^[\w\-.#>+*^:$@!()[\]{}="' ]*$/.test(text) && !/[.#>+^*:]$/.test(text);
  }
  // No tag name: ".card", "#main", "[data-x]", "(header>h1)+main" start with a symbol.
  return /^[.#[(]/.test(text) && text.length > 1 && !/[.#>+^*]$/.test(text);
}

/** True when the cursor is in the text of an HTML page: not inside a tag, a comment, CSS or JavaScript. */
function inMarkup(state: EditorState, pos: number): boolean {
  for (let node: ReturnType<ReturnType<typeof syntaxTree>["resolveInner"]> | null = syntaxTree(state).resolveInner(pos, -1); node; node = node.parent) {
    const name = node.name;
    if (/^(OpenTag|CloseTag|SelfClosingTag|Comment|DoctypeDecl|ProcessingInst|AttributeValue|Script|StyleSheet|Styles)$/.test(name)) return false;
    if (name === "Element") {
      const tag = node.firstChild?.getChild("TagName");
      const tagName = tag ? state.sliceDoc(tag.from, tag.to).toLowerCase() : "";
      return !["script", "style", "textarea", "title"].includes(tagName);
    }
    if (name === "Document") return true;
  }
  return false;
}

const FIELD_OPEN = "\u0001";
const FIELD_MID = "\u0002";
const FIELD_CLOSE = "\u0003";

/** Turns a short form into the editor's snippet text, with a stop for Tab inside every empty spot. */
export function expandToSnippet(abbreviation: string): string | null {
  let html: string;
  try {
    html = expand(abbreviation, {
      type: "markup",
      syntax: "html",
      options: {
        "output.field": (index: number, placeholder: string) => `${FIELD_OPEN}${index}${FIELD_MID}${placeholder ?? ""}${FIELD_CLOSE}`,
      },
    });
  } catch {
    return null;
  }
  if (!html || html === abbreviation) return null;
  const template = html
    .replace(/[\\{}]/g, (c) => "\\" + c)
    .replace(new RegExp(`${FIELD_OPEN}(\\d+)${FIELD_MID}([^${FIELD_CLOSE}]*)${FIELD_CLOSE}`, "g"), (_, index: string, placeholder: string) =>
      placeholder ? `\${${index}:${placeholder}}` : `\${${index}}`,
    );
  // The last Tab always lands after everything that was inserted.
  return template + "${0}";
}

/** Tab: expand the short form in front of the cursor. */
export const expandAbbreviation = (filename: string): Command => (view) => {
  if (!/\.html?$/i.test(filename)) return false;
  const { state } = view;
  const range = state.selection.main;
  if (!range.empty || state.selection.ranges.length > 1) return false;
  if (!inMarkup(state, range.head)) return false;
  const line = state.doc.lineAt(range.head);
  const before = line.text.slice(0, range.head - line.from);
  const found = extract(before, before.length, { type: "markup", lookAhead: false });
  if (!found || !isAbbreviation(found.abbreviation)) return false;
  // A short form stands alone: at the start of the line or right after a tag.
  // In "Read the menu" the last word is part of a sentence, so it stays a word.
  const lead = before.slice(0, found.start);
  if (lead.trim() !== "" && !lead.endsWith(">")) return false;
  // "<a>link|</a>": one word right before a closing tag is text. Tab jumps out instead.
  if (isBareWord(found.abbreviation) && /^\s*<\//.test(line.text.slice(range.head - line.from))) return false;
  const template = expandToSnippet(found.abbreviation);
  if (!template) return false;
  snippet(template)(view, null, line.from + found.start, line.from + found.end);
  return true;
};

/** What Tab jumps over when it is right after the cursor. */
const JUMP = /^(<\/[A-Za-z][\w:-]*\s*>|["'`)\]}>])/;

/** Tab: jump over a closing tag, bracket or quote. In "you|</p>" the cursor lands after </p>. */
export const tabOut: Command = (view) => {
  const { state } = view;
  const range = state.selection.main;
  if (!range.empty || state.selection.ranges.length > 1) return false;
  const line = state.doc.lineAt(range.head);
  const before = line.text.slice(0, range.head - line.from);
  // At the start of a line Tab keeps its normal job: indent.
  if (before.trim() === "") return false;
  const match = JUMP.exec(line.text.slice(range.head - line.from));
  if (!match) return false;
  view.dispatch({ selection: EditorSelection.cursor(range.head + match[0].length), scrollIntoView: true, userEvent: "select" });
  return true;
};

/** Ctrl+Shift+Enter: a new empty line above this one, with the same indent. */
export const insertBlankLineAbove: Command = (view) => {
  const { state } = view;
  const line = state.doc.lineAt(state.selection.main.head);
  const indent = /^\s*/.exec(line.text)?.[0] ?? "";
  view.dispatch({
    changes: { from: line.from, insert: indent + state.lineBreak },
    selection: EditorSelection.cursor(line.from + indent.length),
    scrollIntoView: true,
    userEvent: "input",
  });
  return true;
};

/** The key list for one file. Order matters: the first command that says "done" wins. */
export const fastKeys = (filename: string): KeyBinding[] => [
  { key: "Tab", run: (view) => completionStatus(view.state) === "active" && acceptCompletion(view) },
  { key: "Tab", run: expandAbbreviation(filename) },
  { key: "Tab", run: tabOut },
  { key: "Shift-Mod-Enter", run: insertBlankLineAbove },
  indentWithTab,
];
