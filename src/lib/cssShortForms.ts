/**
 * Short forms for CSS (Emmet), for .css files and for <style> in a page.
 *
 *   m10      margin: 10px;
 *   p10-20   padding: 10px 20px;
 *   fz18     font-size: 18px;
 *   c#333    color: #333;
 *   df       display: flex;
 *   bgc      background-color: #fff;   (the cursor stands on the value)
 *
 * Emmet guesses when it does not know a short form: "foo" becomes "font: optional;".
 * A learner should never get a guess. So only two kinds are accepted:
 *   1. a property with a value: letters, then a number or a color ("m10", "c#333")
 *   2. a word from the list below, where every entry was checked by hand
 */
import { syntaxTree } from "@codemirror/language";
import type { EditorState } from "@codemirror/state";
import expand from "emmet";

/** Short forms made of letters only. tests/editorKeys.test.ts checks what each one becomes. */
export const CSS_WORDS: Record<string, string> = {
  df: "display: flex;",
  dg: "display: grid;",
  db: "display: block;",
  dib: "display: inline-block;",
  dn: "display: none;",
  tac: "text-align: center;",
  tar: "text-align: right;",
  taj: "text-align: justify;",
  fwb: "font-weight: bold;",
  fwn: "font-weight: normal;",
  fsi: "font-style: italic;",
  tdn: "text-decoration: none;",
  tdu: "text-decoration: underline;",
  ttu: "text-transform: uppercase;",
  posr: "position: relative;",
  posa: "position: absolute;",
  posf: "position: fixed;",
  curp: "cursor: pointer;",
  jcc: "justify-content: center;",
  jcsb: "justify-content: space-between;",
  jcfe: "justify-content: flex-end;",
  aic: "align-items: center;",
  aifs: "align-items: flex-start;",
  aife: "align-items: flex-end;",
  fxdc: "flex-direction: column;",
  fxdr: "flex-direction: row;",
  fxww: "flex-wrap: wrap;",
  ovh: "overflow: hidden;",
  ova: "overflow: auto;",
  lisn: "list-style: none;",
  bdn: "border: none;",
  bxz: "box-sizing: border-box;",
  bgc: "background-color: #fff;",
  bd: "border: 1px solid #000;",
  bdrs: "border-radius: ;",
  ff: "font-family: serif;",
  fz: "font-size: ;",
  fw: "font-weight: normal;",
  lh: "line-height: ;",
  trs: "transition: prop time;",
  ta: "text-align: left;",
  td: "text-decoration: none;",
  tt: "text-transform: uppercase;",
  maw: "max-width: ;",
  mah: "max-height: ;",
  miw: "min-width: ;",
  mih: "min-height: ;",
  mt: "margin-top: ;",
  mr: "margin-right: ;",
  mb: "margin-bottom: ;",
  ml: "margin-left: ;",
  pt: "padding-top: ;",
  pr: "padding-right: ;",
  pb: "padding-bottom: ;",
  pl: "padding-left: ;",
};

/** Letters, then a value: "m10", "p10-20", "w100p", "c#333", "op.5", "m0-a", "m10!". */
const WITH_VALUE = /^([a-z]{1,8})(-?\d|\.\d|#)[a-z0-9#.\-]*!?$/;

const FIELD_OPEN = "\u0001";
const FIELD_MID = "\u0002";
const FIELD_CLOSE = "\u0003";
const FIELD = new RegExp(`${FIELD_OPEN}(\\d+)${FIELD_MID}([^${FIELD_CLOSE}]*)${FIELD_CLOSE}`, "g");

const expandCss = (abbreviation: string): string | null => {
  try {
    return expand(abbreviation, {
      type: "stylesheet",
      syntax: "css",
      options: { "output.field": (index: number, placeholder: string) => `${FIELD_OPEN}${index}${FIELD_MID}${placeholder ?? ""}${FIELD_CLOSE}` },
    });
  } catch {
    return null;
  }
};

/** Does the browser know this CSS property? (Outside a browser there is nothing to ask.) */
const knownProperty = (property: string): boolean | null => {
  const css = (globalThis as { CSS?: { supports?: (property: string, value: string) => boolean } }).CSS;
  return css?.supports ? css.supports(property, "initial") : null;
};

/** Is this text a CSS short form that may be expanded? */
export function isCssShortForm(text: string): boolean {
  if (text in CSS_WORDS) return true;
  const match = WITH_VALUE.exec(text);
  if (!match) return false;
  const out = expandCss(text);
  // One finished line, "property: value;", with nothing left to fill in.
  const line = out ? /^([a-z-]+): ([^;\n\u0001]+);$/.exec(out) : null;
  if (!line) return false;
  const known = knownProperty(line[1]);
  // "xyz10" comes back as "xyz: 10;". That is not a property, it is Emmet giving up.
  return known ?? line[1] !== match[1];
}

/** The editor's snippet text for a CSS short form, with a stop on every value that still has to be chosen. */
export function cssToSnippet(abbreviation: string): string | null {
  if (!isCssShortForm(abbreviation)) return null;
  const out = expandCss(abbreviation);
  if (!out) return null;
  let next = 0;
  const template = out
    .replace(/[\\{}]/g, (c) => "\\" + c)
    .replace(FIELD, (_, _index: string, placeholder: string) => {
      next += 1;
      return placeholder ? `\${${next}:${placeholder}}` : `\${${next}}`;
    });
  return template + "${0}";
}

/** The plain text a CSS short form becomes. */
export function cssToText(abbreviation: string): string | null {
  if (!isCssShortForm(abbreviation)) return null;
  const out = expandCss(abbreviation);
  return out ? out.replace(FIELD, (_, _index: string, placeholder: string) => placeholder) : null;
}

/**
 * True when the cursor is where CSS declarations are written: between the { } of a rule,
 * or in a style="" attribute. Not where selectors go, where "h1" must stay "h1".
 */
export function inDeclarations(state: EditorState, pos: number): boolean {
  for (let node: ReturnType<ReturnType<typeof syntaxTree>["resolveInner"]> | null = syntaxTree(state).resolveInner(pos, -1); node; node = node.parent) {
    const name = node.name;
    if (name === "Comment" || name === "StringLiteral") return false;
    if (name === "Styles") return true;
    if (name === "Block") return node.parent?.name === "RuleSet" || node.parent?.name === "KeyframeList";
  }
  return false;
}
