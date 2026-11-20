/**
 * Gives every piece of code a class name by what it is: a tag, an attribute, a
 * string and so on. The editor and the answer boxes both use it, and the theme
 * colors those classes. The kinds follow the names VS Code themes use, so a
 * theme looks here the way it looks in VS Code.
 */
import { tagHighlighter, tags as t, type Highlighter } from "@lezer/highlight";

const base = tagHighlighter([
  { tag: t.comment, class: "tok-comment" },
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword], class: "tok-keyword" },
  { tag: [t.definitionKeyword, t.modifier], class: "tok-storage" },
  { tag: [t.string, t.special(t.string), t.attributeValue, t.regexp, t.url], class: "tok-string" },
  { tag: [t.number, t.integer, t.float, t.unit, t.color], class: "tok-number" },
  { tag: [t.bool, t.null, t.atom, t.self, t.character, t.escape, t.constant(t.name), t.standard(t.name)], class: "tok-constant" },
  { tag: [t.tagName, t.meta, t.documentMeta, t.processingInstruction], class: "tok-tag" },
  { tag: t.attributeName, class: "tok-attr" },
  { tag: [t.angleBracket, t.punctuation, t.bracket, t.separator, t.derefOperator], class: "tok-punct" },
  { tag: [t.propertyName, t.definition(t.propertyName)], class: "tok-property" },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.function(t.definition(t.variableName))], class: "tok-function" },
  { tag: [t.variableName, t.definition(t.variableName), t.local(t.variableName), t.labelName], class: "tok-variable" },
  { tag: [t.typeName, t.className, t.namespace, t.definition(t.typeName)], class: "tok-type" },
  { tag: [t.operator, t.definitionOperator, t.compareOperator, t.logicOperator, t.arithmeticOperator, t.updateOperator], class: "tok-operator" },
  { tag: t.invalid, class: "tok-invalid" },
]);

/** CSS has its own names for some things. Only used inside CSS (a .css file or a <style> block). */
const cssOnly: Highlighter = {
  style: tagHighlighter([
    { tag: t.propertyName, class: "tok-cssprop" },
    { tag: [t.className, t.labelName], class: "tok-cssclass" },
    { tag: t.atom, class: "tok-cssvalue" },
  ]).style,
  scope: (node) => node.name === "StyleSheet" || node.name === "Styles",
};

/** In HTML the "=" of an attribute is plain punctuation, not an operator as in JavaScript. */
const htmlOnly: Highlighter = {
  style: tagHighlighter([{ tag: t.definitionOperator, class: "tok-htmlis" }]).style,
  scope: (node) => node.name === "Document",
};

export const highlighters: readonly Highlighter[] = [base, cssOnly, htmlOnly];
