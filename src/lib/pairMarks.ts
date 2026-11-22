import { type Extension, StateEffect, StateField } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

/**
 * The marks around a pair: two brackets that belong together, or the two names of one tag.
 *
 * They are useful to look at, but a box next to the cursor hides the cursor. So the marks
 * only show after a click (you point at something to see its partner). They go away as soon
 * as you type, or move the cursor with the keyboard.
 *
 * The marks themselves are drawn by the editor all the time. This only puts a class on the
 * editor (cm-show-pairs), and the stylesheet shows the marks when the class is there.
 */

const clicked = StateEffect.define<null>();

const shown = StateField.define<boolean>({
  create: () => false,
  update(value, tr) {
    // A click (or a tap) that placed the cursor.
    if (tr.isUserEvent("select.pointer") || tr.effects.some((effect) => effect.is(clicked))) return true;
    // Typing, deleting, pasting, undo: the text changed. Arrow keys, Home, End, Tab stops: the cursor moved.
    if (tr.docChanged || tr.selection) return false;
    return value;
  },
});

export const pairMarks: Extension = [
  shown,
  EditorView.editorAttributes.compute([shown], (state) => ({ class: state.field(shown) ? "cm-show-pairs" : "" })),
  // A click on the place where the cursor already is does not move it, so the editor reports nothing. This catches it.
  EditorView.domEventHandlers({
    mousedown(event, view) {
      if (event.button === 0) view.dispatch({ effects: clicked.of(null) });
      return false;
    },
  }),
];
