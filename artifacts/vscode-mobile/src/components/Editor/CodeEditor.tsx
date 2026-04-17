import { useEffect, useRef, useCallback } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, rectangularSelection, crosshairCursor, dropCursor } from "@codemirror/view";
import { EditorState, StateEffect } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { indentOnInput, bracketMatching, foldGutter, syntaxHighlighting, defaultHighlightStyle, StreamLanguage } from "@codemirror/language";
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

interface CodeEditorProps {
  fileId: string;
  content: string;
  language: string;
  onChange: (content: string) => void;
}

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

export function CodeEditor({ fileId, content, language, onChange }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const contentRef = useRef(content);
  const { theme, fontSize, tabSize, wordWrap, lineNumbers: showLineNumbers } = useEditorStore();

  const getThemeExtension = useCallback(() => {
    if (theme === "dark") return oneDark;

    return EditorView.theme({
      "&": {
        backgroundColor: "hsl(220 14% 98%)",
        color: "hsl(220 14% 15%)",
        fontFamily: "JetBrains Mono, Fira Code, Cascadia Code, Consolas, monospace",
      },
      ".cm-content": { caretColor: "#007acc" },
      "&.cm-focused .cm-cursor": { borderLeftColor: "#007acc" },
      ".cm-gutters": {
        backgroundColor: "hsl(220 14% 93%)",
        color: "hsl(220 9% 55%)",
        borderRight: "1px solid hsl(220 13% 87%)",
      },
      ".cm-activeLineGutter": { backgroundColor: "hsl(207 90% 90%)" },
      ".cm-activeLine": { backgroundColor: "hsl(207 90% 95%)" },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
        backgroundColor: "hsl(207 90% 80%)",
      },
      ".cm-searchMatch": { backgroundColor: "#ffd70040", outline: "1px solid #ffd700" },
      ".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: "#ffd70080" },
    });
  }, [theme]);

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
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
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
      EditorView.lineWrapping,
      getThemeExtension(),
      showLineNumbers ? lineNumbers() : [],
      !wordWrap ? [] : [],
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newContent = update.state.doc.toString();
          contentRef.current = newContent;
          onChange(newContent);
        }
      }),
      EditorView.theme({
        "&": { fontSize: `${fontSize}px` },
      }),
      langExt,
    ].flat();

    const state = EditorState.create({
      doc: content,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [fileId, language]);

  // Update content when switching files
  useEffect(() => {
    if (!viewRef.current || content === contentRef.current) return;
    contentRef.current = content;
    viewRef.current.dispatch({
      changes: {
        from: 0,
        to: viewRef.current.state.doc.length,
        insert: content,
      },
    });
  }, [fileId, content]);

  // Update font size
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: StateEffect.reconfigure.of([
        EditorView.theme({ "&": { fontSize: `${fontSize}px` } }),
      ]),
    });
  }, [fontSize]);

  return (
    <div
      ref={editorRef}
      className="h-full w-full overflow-hidden"
      data-testid="code-editor"
    />
  );
}
