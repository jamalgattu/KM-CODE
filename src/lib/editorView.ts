import { EditorView } from "@codemirror/view";
import { Transaction } from "@codemirror/state";
import { undo, redo, selectAll } from "@codemirror/commands";
import { openSearchPanel } from "@codemirror/search";

let _view: EditorView | null = null;

export const setCurrentEditorView = (v: EditorView | null) => {
  _view = v;
};

export const getCurrentEditorView = () => _view;

export const insertAtCursor = (text: string) => {
  if (!_view) return;
  const { from, to } = _view.state.selection.main;
  _view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: from + text.length },
  });
  _view.focus();
};

export const indentCurrentLine = () => {
  if (!_view) return;
  _view.dispatch({
    annotations: Transaction.userEvent.of("input"),
  });
  _view.focus();
};

export const undoEditor = () => {
  if (!_view) return;
  undo(_view);
  _view.focus();
};

export const redoEditor = () => {
  if (!_view) return;
  redo(_view);
  _view.focus();
};

export const openFindPanel = () => {
  if (!_view) return;
  openSearchPanel(_view);
  _view.focus();
};

export const selectAllEditor = () => {
  if (!_view) return;
  selectAll(_view);
  _view.focus();
};
