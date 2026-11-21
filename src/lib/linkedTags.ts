/**
 * Rename both tags at once.
 *
 * Put the cursor in the name of an opening tag (or a closing tag) and change it:
 * the other tag of the pair changes with it. <div>…</div> becomes <section>…</section>
 * by typing the name once. VS Code calls this "linked editing".
 *
 * How it works: while the cursor is inside a tag name that has a partner with the
 * same name, the two places are remembered. Every change inside one of them is
 * repeated in the other, in the same step, so one Undo takes both back.
 */
import { syntaxTree } from "@codemirror/language";
import { Annotation, EditorState, StateField, type Extension } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

interface Span {
  from: number;
  to: number;
}

interface Pair {
  open: Span;
  close: Span;
}

/** What may be typed into a tag name. An empty name is allowed while you retype it. */
const NAME_PART = /^[A-Za-z0-9:-]*$/;

/** The opening and closing name of the element whose tag name the cursor touches. */
function pairAt(state: EditorState, pos: number): Pair | null {
  const tree = syntaxTree(state);
  let node = tree.resolveInner(pos, -1);
  if (node.name !== "TagName") node = tree.resolveInner(pos, 1);
  if (node.name !== "TagName") return null;
  const tag = node.parent;
  if (!tag || (tag.name !== "OpenTag" && tag.name !== "CloseTag")) return null;
  const element = tag.parent;
  const open = element?.firstChild;
  const close = element?.lastChild;
  if (!element || element.name !== "Element" || !open || !close || open.name !== "OpenTag" || close.name !== "CloseTag") return null;
  const openName = open.getChild("TagName");
  const closeName = close.getChild("TagName");
  if (!openName || !closeName) return null;
  if (state.sliceDoc(openName.from, openName.to) !== state.sliceDoc(closeName.from, closeName.to)) return null;
  return { open: { from: openName.from, to: openName.to }, close: { from: closeName.from, to: closeName.to } };
}

const inside = (span: Span, pos: number) => pos >= span.from && pos <= span.to;

const mark = Decoration.mark({ class: "cm-linkedTag" });

const linked = StateField.define<Pair | null>({
  create: () => null,
  update(pair, tr) {
    const state = tr.state;
    if (state.selection.ranges.length !== 1) return null;
    const head = state.selection.main.head;
    if (pair) {
      // Text typed at the edge of a name belongs to the name.
      const map = (span: Span): Span => ({ from: tr.changes.mapPos(span.from, -1), to: tr.changes.mapPos(span.to, 1) });
      const next = tr.docChanged ? { open: map(pair.open), close: map(pair.close) } : pair;
      const a = state.sliceDoc(next.open.from, next.open.to);
      const b = state.sliceDoc(next.close.from, next.close.to);
      if (a === b && NAME_PART.test(a) && (inside(next.open, head) || inside(next.close, head))) return next;
    }
    return pairAt(state, head);
  },
  provide: (field) =>
    EditorView.decorations.from(field, (pair) => {
      if (!pair || pair.open.from === pair.open.to) return Decoration.none;
      return Decoration.set([mark.range(pair.open.from, pair.open.to), mark.range(pair.close.from, pair.close.to)]);
    }),
});

const mirrored = Annotation.define<boolean>();

/** Repeats a change in one tag name in its partner. */
const mirror = EditorState.transactionFilter.of((tr) => {
  if (!tr.docChanged || tr.annotation(mirrored)) return tr;
  // Only what a person types, pastes or deletes. Undo already holds both changes.
  if (!(tr.isUserEvent("input") || tr.isUserEvent("delete")) || tr.isUserEvent("undo") || tr.isUserEvent("redo")) return tr;
  const pair = tr.startState.field(linked, false);
  if (!pair) return tr;

  const changes: { from: number; to: number; insert: string }[] = [];
  let fits = true;
  tr.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
    const text = inserted.toString();
    const self = fromA >= pair.open.from && toA <= pair.open.to ? pair.open : fromA >= pair.close.from && toA <= pair.close.to ? pair.close : null;
    if (!self || !NAME_PART.test(text)) {
      fits = false;
      return;
    }
    const other = self === pair.open ? pair.close : pair.open;
    changes.push({ from: other.from + (fromA - self.from), to: other.from + (toA - self.from), insert: text });
  });
  if (!fits || changes.length === 0) return tr;
  return [tr, { changes, annotations: mirrored.of(true) }];
});

/** Linked tag names, for HTML files. */
export const linkedTags = (filename: string): Extension => (/\.html?$/i.test(filename) ? [linked, mirror] : []);
