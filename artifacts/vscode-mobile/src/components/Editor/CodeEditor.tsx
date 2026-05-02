import { useCallback, useEffect, useRef } from "react";
import {
  EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter,
  drawSelection, rectangularSelection, crosshairCursor, dropCursor,
} from "@codemirror/view";
import { EditorState, StateEffect } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import {
  indentOnInput, bracketMatching, foldGutter, syntaxHighlighting,
  HighlightStyle,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { lintKeymap } from "@codemirror/lint";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import { rust } from "@codemirror/lang-rust";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { php } from "@codemirror/lang-php";
import { xml } from "@codemirror/lang-xml";
import { oneDark } from "@codemirror/theme-one-dark";
import { useEditorStore } from "@/store/editorStore";
import { setCurrentEditorView } from "@/lib/editorView";

interface CodeEditorProps {
  fileId: string;
  content: string;
  language: string;
  onChange: (content: string) => void;
  onCursorChange?: (line: number, col: number) => void;
}

// Rich light-theme highlight style
const lightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword,               color: "#7c3aed", fontWeight: "bold" },
  { tag: tags.controlKeyword,        color: "#7c3aed", fontWeight: "bold" },
  { tag: tags.operatorKeyword,       color: "#7c3aed" },
  { tag: tags.definitionKeyword,     color: "#1d4ed8", fontWeight: "bold" },
  { tag: tags.moduleKeyword,         color: "#1d4ed8", fontWeight: "bold" },
  { tag: tags.string,                color: "#16a34a" },
  { tag: tags.special(tags.string),  color: "#15803d" },
  { tag: tags.number,                color: "#dc2626" },
  { tag: tags.bool,                  color: "#dc2626", fontWeight: "bold" },
  { tag: tags.null,                  color: "#dc2626", fontWeight: "bold" },
  { tag: tags.comment,               color: "#6b7280", fontStyle: "italic" },
  { tag: tags.lineComment,           color: "#6b7280", fontStyle: "italic" },
  { tag: tags.blockComment,          color: "#6b7280", fontStyle: "italic" },
  { tag: tags.function(tags.variableName), color: "#d97706" },
  { tag: tags.function(tags.propertyName), color: "#d97706" },
  { tag: tags.definition(tags.variableName), color: "#0369a1" },
  { tag: tags.definition(tags.propertyName), color: "#0369a1" },
  { tag: tags.variableName,          color: "#334155" },
  { tag: tags.propertyName,         color: "#0f766e" },
  { tag: tags.className,            color: "#0369a1", fontWeight: "bold" },
  { tag: tags.typeName,             color: "#0369a1" },
  { tag: tags.namespace,            color: "#0369a1" },
  { tag: tags.operator,             color: "#374151" },
  { tag: tags.punctuation,          color: "#6b7280" },
  { tag: tags.bracket,              color: "#374151" },
  { tag: tags.angleBracket,         color: "#374151" },
  { tag: tags.tagName,              color: "#dc2626", fontWeight: "bold" },
  { tag: tags.attributeName,        color: "#d97706" },
  { tag: tags.attributeValue,       color: "#16a34a" },
  { tag: tags.url,                  color: "#2563eb", textDecoration: "underline" },
  { tag: tags.regexp,               color: "#0891b2" },
  { tag: tags.escape,               color: "#9333ea" },
  { tag: tags.color,                color: "#0891b2" },
  { tag: tags.atom,                 color: "#dc2626" },
  { tag: tags.meta,                 color: "#7c3aed" },
  { tag: tags.processingInstruction, color: "#7c3aed" },
  { tag: tags.heading,              color: "#1d4ed8", fontWeight: "bold" },
  { tag: tags.emphasis,             fontStyle: "italic" },
  { tag: tags.strong,               fontWeight: "bold" },
  { tag: tags.link,                 color: "#2563eb", textDecoration: "underline" },
  { tag: tags.strikethrough,        textDecoration: "line-through" },
]);

function getLanguageExtension(language: string) {
  switch (language) {
    case "javascript":
    case "typescript":
      return javascript({ typescript: language === "typescript", jsx: true });
    case "python":
      return python();
    case "css":
    case "scss":
      return css();
    case "html":
      return html();
    case "json":
      return json();
    case "markdown":
      return markdown();
    case "sql":
      return sql();
    case "rust":
      return rust();
    case "java":
      return java();
    case "cpp":
    case "c":
      return cpp();
    case "php":
      return php();
    case "xml":
      return xml();
    default:
      return [];
  }
}

export function CodeEditor({ fileId, content, language, onChange, onCursorChange }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const contentRef = useRef(content);
  const { theme, fontSize, tabSize, wordWrap, lineNumbers: showLineNumbers, fontFamily } = useEditorStore();

  const getThemeExtensions = useCallback(() => {
    if (theme === "dark") {
      return [oneDark];
    }

    return [
      EditorView.theme({
        "&": {
          backgroundColor: "hsl(220 14% 98%)",
          color: "#334155",
          fontFamily: `${fontFamily}, JetBrains Mono, monospace`,
        },
        ".cm-content": { caretColor: "#7c3aed" },
        "&.cm-focused .cm-cursor": { borderLeftColor: "#7c3aed" },
        ".cm-gutters": {
          backgroundColor: "hsl(220 14% 94%)",
          color: "#94a3b8",
          borderRight: "1px solid hsl(220 13% 87%)",
        },
        ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 4px" },
        ".cm-activeLineGutter": { backgroundColor: "hsl(220 80% 95%)" },
        ".cm-activeLine": { backgroundColor: "hsl(220 80% 97%)" },
        "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
          backgroundColor: "#bfdbfe",
        },
        ".cm-foldPlaceholder": { backgroundColor: "#e0e7ff", color: "#4338ca", border: "1px solid #c7d2fe" },
        ".cm-searchMatch": { backgroundColor: "#fef08a", outline: "1px solid #facc15" },
        ".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: "#fde047" },
        ".cm-tooltip": { backgroundColor: "hsl(220 14% 98%)", border: "1px solid hsl(220 13% 87%)" },
        ".cm-completionLabel": { color: "#334155" },
        ".cm-completionDetail": { color: "#64748b" },
      }),
      syntaxHighlighting(lightHighlightStyle),
    ];
  }, [theme, fontFamily]);

  // Keep a ref to `onChange` so the updateListener closure is never stale
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!editorRef.current) return;

    const langExt = getLanguageExtension(language);
    const extensions = [
      history(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      crosshairCursor(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      highlightSelectionMatches(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      foldGutter(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...completionKeymap,
        ...lintKeymap,
        indentWithTab,
      ]),
      EditorState.tabSize.of(tabSize),
      wordWrap ? EditorView.lineWrapping : [],
      ...getThemeExtensions(),
      showLineNumbers ? lineNumbers() : [],
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newContent = update.state.doc.toString();
          contentRef.current = newContent;
          onChangeRef.current(newContent); // always call the latest onChange
        }
        if (update.selectionSet || update.docChanged) {
          if (onCursorChange) {
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            onCursorChange(line.number, pos - line.from + 1);
          }
        }
      }),
      EditorView.theme({
        "&": {
          fontSize: `${fontSize}px`,
          fontFamily: `${fontFamily}, JetBrains Mono, monospace`,
          height: "100%",
        },
        ".cm-scroller": {
          fontFamily: "inherit",
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        },
        ".cm-content": { touchAction: "pan-y" },
      }),
      langExt,
    ].flat();

    const state = EditorState.create({ doc: content, extensions });
    const view = new EditorView({ state, parent: editorRef.current });

    viewRef.current = view;
    setCurrentEditorView(view);

    return () => {
      setCurrentEditorView(null);
      view.destroy();
      viewRef.current = null;
    };
  }, [fileId, language, theme]);

  useEffect(() => {
    if (!viewRef.current || content === contentRef.current) return;
    contentRef.current = content;
    viewRef.current.dispatch({
      changes: { from: 0, to: viewRef.current.state.doc.length, insert: content },
    });
  }, [fileId, content]);

  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: StateEffect.reconfigure.of([
        EditorView.theme({
          "&": { fontSize: `${fontSize}px`, fontFamily: `${fontFamily}, JetBrains Mono, monospace` },
          ".cm-scroller": { fontFamily: "inherit" },
        }),
      ]),
    });
  }, [fontSize, fontFamily]);

  return (
    <div
      ref={editorRef}
      className="h-full w-full"
      style={{ overflow: "hidden" }}
      data-testid="code-editor"
    />
  );
}
