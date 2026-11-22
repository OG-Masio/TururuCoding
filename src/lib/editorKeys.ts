/**
 * Keys that make typing HTML faster, the way VS Code does it.
 *
 *   Tab            expands a short form (Emmet): "p" becomes <p></p>, "ul>li*3" a whole list
 *   Tab            in CSS: "m10" becomes margin: 10px;  "df" becomes display: flex;  (see cssShortForms.ts)
 *   Enter          accepts a short form that a suggestion is shown for: "!" becomes a whole page
 *   Tab            jumps over a closing tag, bracket or quote that is right after the cursor
 *   Tab            otherwise indents the line (Shift+Tab takes the indent away)
 *   Ctrl+Shift+Enter   opens a new line above
 *
 * Ctrl+Enter (a new line below, from anywhere in the line) and the keys for
 * moving and copying lines already come with the editor.
 */
import { acceptCompletion, autocompletion, clearSnippet, closeCompletion, completionStatus, snippet, type CompletionContext, type CompletionResult } from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { syntaxTree } from "@codemirror/language";
import { EditorSelection, EditorState, Prec, Transaction, type Extension } from "@codemirror/state";
import { EditorView, keymap, type Command } from "@codemirror/view";
import expand, { extract } from "emmet";
import { cssToSnippet, cssToText, inDeclarations, isCssShortForm } from "./cssShortForms";

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
  // The page starter ("!") has stops inside its <meta> lines. A beginner never changes those,
  // so they become plain text: the first stop is the page title, the next one the body.
  const calm = template.replace(/<meta\b[^>]*>/g, (tag) => tag.replace(/\$\{\d+:([^}]*)\}/g, "$1"));
  // The last Tab always lands after everything that was inserted.
  return calm + "${0}";
}

/** The text a short form becomes, without the stops. Shown next to a suggestion. */
export function expandToText(abbreviation: string): string | null {
  try {
    const html = expand(abbreviation, { type: "markup", syntax: "html", options: { "output.field": (_index: number, placeholder: string) => placeholder ?? "" } });
    return html && html !== abbreviation ? html.replace(/\t/g, "  ") : null;
  } catch {
    return null;
  }
}

/**
 * Short forms that also get a suggestion, which Enter accepts: "!" and every
 * form with a symbol in it ("ul>li*3", "div.card"). A plain tag name ("p") is
 * left to Tab, so that Enter after a word always starts a new line.
 */
export const suggestsItself = (abbreviation: string) => abbreviation === "!" || !isBareWord(abbreviation);

interface Found {
  from: number;
  to: number;
  abbreviation: string;
  /** The language the short form is written in. */
  kind: "html" | "css";
}

/** Where is the cursor: in the text of a page, where CSS declarations go, or somewhere short forms do not work? */
function placeAt(state: EditorState, pos: number, filename: string): "html" | "css" | null {
  if (/\.css$/i.test(filename)) return inDeclarations(state, pos) ? "css" : null;
  if (!/\.html?$/i.test(filename)) return null;
  if (inDeclarations(state, pos)) return "css";
  return inMarkup(state, pos) ? "html" : null;
}

/** The short form in front of the cursor, when there is one and it is meant as one. */
function abbreviationAt(state: EditorState, filename: string): Found | null {
  const range = state.selection.main;
  if (!range.empty || state.selection.ranges.length > 1) return null;
  const kind = placeAt(state, range.head, filename);
  if (!kind) return null;
  const line = state.doc.lineAt(range.head);
  const before = line.text.slice(0, range.head - line.from);

  if (kind === "css") {
    const found = extract(before, before.length, { type: "stylesheet", lookAhead: false });
    if (!found || !isCssShortForm(found.abbreviation)) return null;
    // Only where a property starts: at the start of the line, or right after "{" or ";". Never in a value.
    const lead = before.slice(0, found.start).trimEnd();
    if (lead !== "" && !/[{;"']$/.test(lead)) return null;
    return { from: line.from + found.start, to: line.from + found.end, abbreviation: found.abbreviation, kind };
  }

  const found = extract(before, before.length, { type: "markup", lookAhead: false });
  if (!found || !isAbbreviation(found.abbreviation)) return null;
  // A short form stands alone: at the start of the line or right after a tag.
  // In "Read the menu" the last word is part of a sentence, so it stays a word.
  const lead = before.slice(0, found.start);
  if (lead.trim() !== "" && !lead.endsWith(">")) return null;
  // "<a>link|</a>": one word right before a closing tag is text. Tab jumps out instead.
  if (isBareWord(found.abbreviation) && /^\s*<\//.test(line.text.slice(range.head - line.from))) return null;
  return { from: line.from + found.start, to: line.from + found.end, abbreviation: found.abbreviation, kind };
}

const snippetFor = (found: Found) => (found.kind === "css" ? cssToSnippet(found.abbreviation) : expandToSnippet(found.abbreviation));
const textFor = (found: Found) => (found.kind === "css" ? cssToText(found.abbreviation) : expandToText(found.abbreviation));

/**
 * Should this short form get a suggestion here? The page starter only when it stands
 * alone on its line and the file has no page yet: a page inside a page is never wanted.
 * A CSS short form always: no CSS property starts with "m10" or "df", so nothing is lost.
 */
function suggestHere(state: EditorState, found: Found): boolean {
  if (found.kind === "css") return true;
  if (!suggestsItself(found.abbreviation)) return false;
  if (found.abbreviation !== "!" && found.abbreviation !== "!!!") return true;
  const line = state.doc.lineAt(found.from);
  const alone = line.text.slice(0, found.from - line.from).trim() === "" && line.text.slice(found.to - line.from).trim() === "";
  return alone && !/<html[\s>]/i.test(state.doc.toString());
}

/** Tab: expand the short form in front of the cursor. */
export const expandAbbreviation = (filename: string): Command => (view) => {
  const found = abbreviationAt(view.state, filename);
  const template = found && snippetFor(found);
  if (!found || !template) return false;
  snippet(template)(view, null, found.from, found.to);
  return true;
};

/**
 * Enter: accept the short form, the way VS Code does for "!".
 * Only while its suggestion is on the screen or on its way. After Esc, Enter is a new line again.
 */
export const acceptAbbreviation = (filename: string): Command => (view) => {
  if (completionStatus(view.state) === null) return false;
  const found = abbreviationAt(view.state, filename);
  if (!found || !suggestHere(view.state, found)) return false;
  const template = snippetFor(found);
  if (!template) return false;
  closeCompletion(view);
  snippet(template)(view, null, found.from, found.to);
  return true;
};

const previewNode = (text: string) => {
  const box = document.createElement("pre");
  box.className = "emmet-preview";
  box.textContent = text;
  return box;
};

/** The suggestion for a short form: shows what it becomes before you accept it. */
export const abbreviationCompletions =
  (filename: string) =>
  (context: CompletionContext): CompletionResult | null => {
    const found = abbreviationAt(context.state, filename);
    if (!found || found.to !== context.pos || !suggestHere(context.state, found)) return null;
    const template = snippetFor(found);
    const text = textFor(found);
    if (!template || !text) return null;
    return {
      from: found.from,
      to: found.to,
      filter: false,
      options: [
        {
          label: found.abbreviation,
          detail: found.kind === "css" ? text : found.abbreviation === "!" ? "a whole empty page" : "short form",
          type: "text",
          boost: 99,
          info: found.kind === "css" ? undefined : () => previewNode(text),
          apply: (view, completion, from, to) => snippet(template)(view, completion, from, to),
        },
      ],
    };
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

/**
 * A short form leaves stops behind: the places Tab jumps to next ("<footer>|</footer>", then after it).
 * They are for filling in one line. When you press Enter inside a new tag you start writing its
 * content, so the stops end there. Without this, the next Tab would not expand "p" or indent:
 * it would jump to the old stop after the closing tag.
 */
const stopsEndOnNewLine = EditorView.updateListener.of((update) => {
  if (!update.docChanged) return;
  for (const tr of update.transactions) {
    // "input" alone is a new line typed by hand (Enter, Ctrl+Enter). A short form that is being inserted is "input.complete".
    if (tr.annotation(Transaction.userEvent) !== "input") continue;
    let newLine = false;
    tr.changes.iterChanges((_fromA, _toA, _fromB, _toB, inserted) => {
      if (inserted.lines > 1) newLine = true;
    });
    if (newLine) {
      clearSnippet(update.view);
      return;
    }
  }
});

/** Everything in this file as one editor extension, for one file. Order matters: the first command that says "done" wins. */
export const fastKeys = (filename: string): Extension => {
  // One list for the whole life of the editor: the editor recognises a source of suggestions by being the very same function.
  const suggestions = [{ autocomplete: abbreviationCompletions(filename) }];
  return [
    // First of all, also before "jump to the next stop": a short form in front of the cursor is expanded.
    Prec.highest(
      keymap.of([
        { key: "Tab", run: (view) => completionStatus(view.state) === "active" && acceptCompletion(view) },
        { key: "Tab", run: expandAbbreviation(filename) },
      ]),
    ),
    // Before the editor's own Enter (a new line).
    Prec.high(keymap.of([{ key: "Enter", run: acceptAbbreviation(filename) }])),
    keymap.of([{ key: "Tab", run: tabOut }, { key: "Shift-Mod-Enter", run: insertBlankLineAbove }, indentWithTab]),
    stopsEndOnNewLine,
    EditorState.languageData.of(() => suggestions),
    // A list that is on the screen can be used at once. (The editor normally waits a moment, and a fast Enter or Tab would miss it.)
    autocompletion({ interactionDelay: 0 }),
  ];
};
