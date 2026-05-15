import { useCallback, useEffect, useRef } from "react";
import {
  EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter,
  drawSelection, rectangularSelection, crosshairCursor, dropCursor, highlightSpecialChars,
} from "@codemirror/view";
import { Compartment, EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab, toggleComment, moveLineUp, moveLineDown } from "@codemirror/commands";
import {
  indentOnInput, bracketMatching, foldGutter, foldKeymap, syntaxHighlighting,
  HighlightStyle, defaultHighlightStyle, StreamLanguage,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import {
  closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap,
  snippetCompletion, CompletionContext, Completion,
} from "@codemirror/autocomplete";
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
import { go } from "@codemirror/legacy-modes/mode/go";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { ruby } from "@codemirror/legacy-modes/mode/ruby";
import { kotlin } from "@codemirror/legacy-modes/mode/clike";
import { swift } from "@codemirror/legacy-modes/mode/swift";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";
import { useEditorStore } from "@/store/editorStore";
import { setCurrentEditorView } from "@/lib/editorView";
import { getEditorThemeExtensions, DARK_THEME_IDS } from "@/lib/editorThemes";

interface CodeEditorProps {
  fileId: string;
  content: string;
  language: string;
  onChange: (content: string) => void;
  onCursorChange?: (line: number, col: number) => void;
}

// ─── Language-specific snippet completions ──────────────────────────────────

const S = (template: string, opts: Omit<Completion, "apply">) =>
  snippetCompletion(template, opts);

const JS_SNIPPETS: Completion[] = [
  S("console.log(${});",                       { label: "cl",     detail: "console.log",          type: "function" }),
  S("console.error(${});",                     { label: "cle",    detail: "console.error",         type: "function" }),
  S("function ${name}(${params}) {\n\t${}\n}",{ label: "fn",     detail: "function declaration",  type: "keyword"  }),
  S("const ${name} = (${params}) => {\n\t${}\n};",{ label: "afn",detail: "arrow function",        type: "keyword"  }),
  S("import ${name} from '${module}';",        { label: "imp",    detail: "import default",        type: "keyword"  }),
  S("import { ${name} } from '${module}';",    { label: "imd",    detail: "import named",          type: "keyword"  }),
  S("if (${condition}) {\n\t${}\n}",           { label: "if",     detail: "if statement",          type: "keyword"  }),
  S("if (${condition}) {\n\t${}\n} else {\n\t${}\n}", { label: "ife", detail: "if/else",          type: "keyword"  }),
  S("for (let ${i} = 0; ${i} < ${n}; ${i}++) {\n\t${}\n}", { label: "for", detail: "for loop",   type: "keyword"  }),
  S("for (const ${item} of ${array}) {\n\t${}\n}", { label: "forof", detail: "for…of loop",       type: "keyword"  }),
  S("try {\n\t${}\n} catch (${err}) {\n\t${}\n}", { label: "try", detail: "try/catch",            type: "keyword"  }),
  S("class ${Name} {\n\tconstructor(${params}) {\n\t\t${}\n\t}\n}", { label: "class", detail: "class", type: "keyword" }),
  S("async function ${name}(${params}) {\n\t${}\n}", { label: "async", detail: "async function",  type: "keyword"  }),
  S("await ${};",                              { label: "aw",     detail: "await expression",      type: "keyword"  }),
  S("new Promise((resolve, reject) => {\n\t${}\n});", { label: "prom", detail: "new Promise",     type: "class"    }),
  S("switch (${value}) {\n\tcase ${case1}:\n\t\t${}\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}", { label: "sw", detail: "switch/case", type: "keyword" }),
];

const PY_SNIPPETS: Completion[] = [
  S("print(${})",                              { label: "pr",   detail: "print()",               type: "function" }),
  S("def ${name}(${params}):\n\t${}",          { label: "def",  detail: "function definition",   type: "keyword"  }),
  S("class ${Name}:\n\tdef __init__(self, ${params}):\n\t\t${}", { label: "cls", detail: "class definition", type: "keyword" }),
  S("if ${condition}:\n\t${}",                 { label: "if",   detail: "if statement",           type: "keyword"  }),
  S("if ${condition}:\n\t${}\nelse:\n\t${}",   { label: "ife",  detail: "if/else",                type: "keyword"  }),
  S("for ${item} in ${iterable}:\n\t${}",      { label: "for",  detail: "for loop",               type: "keyword"  }),
  S("while ${condition}:\n\t${}",              { label: "wh",   detail: "while loop",             type: "keyword"  }),
  S("try:\n\t${}\nexcept ${Exception} as ${e}:\n\t${}", { label: "try", detail: "try/except",    type: "keyword"  }),
  S("import ${}",                              { label: "imp",  detail: "import module",           type: "keyword"  }),
  S("from ${module} import ${name}",           { label: "fr",   detail: "from…import",             type: "keyword"  }),
  S("if __name__ == '__main__':\n\t${}",       { label: "main", detail: "__main__ guard",          type: "keyword"  }),
  S("[${expr} for ${x} in ${iterable}]",       { label: "lc",   detail: "list comprehension",      type: "keyword"  }),
  S("with ${expr} as ${var}:\n\t${}",          { label: "with", detail: "context manager",         type: "keyword"  }),
  S("lambda ${params}: ${}",                   { label: "lam",  detail: "lambda function",         type: "keyword"  }),
];

const CPP_SNIPPETS: Completion[] = [
  S("#include <${iostream}>",                  { label: "inc",    detail: "#include",              type: "keyword"  }),
  S("int main() {\n\t${}\n\treturn 0;\n}",     { label: "main",   detail: "main function",         type: "function" }),
  S("std::cout << ${} << std::endl;",          { label: "cout",   detail: "cout",                  type: "function" }),
  S("std::cin >> ${};",                        { label: "cin",    detail: "cin",                   type: "function" }),
  S("for (int ${i} = 0; ${i} < ${n}; ${i}++) {\n\t${}\n}", { label: "for", detail: "for loop",   type: "keyword"  }),
  S("for (auto& ${item} : ${container}) {\n\t${}\n}", { label: "forr", detail: "range-for",       type: "keyword"  }),
  S("${void} ${name}(${params}) {\n\t${}\n}",  { label: "fn",     detail: "function",              type: "keyword"  }),
  S("struct ${Name} {\n\t${}\n};",             { label: "struct", detail: "struct",                type: "keyword"  }),
  S("class ${Name} {\npublic:\n\t${}\nprivate:\n\t\n};", { label: "class", detail: "class",        type: "keyword"  }),
  S("std::vector<${int}> ${v};",               { label: "vec",    detail: "vector",                type: "class"    }),
  S("std::map<${string}, ${int}> ${m};",       { label: "map",    detail: "map",                   type: "class"    }),
  S("if (${condition}) {\n\t${}\n}",           { label: "if",     detail: "if statement",          type: "keyword"  }),
  S("try {\n\t${}\n} catch (${exception}& ${e}) {\n\t${}\n}", { label: "try", detail: "try/catch",type: "keyword"  }),
];

const JAVA_SNIPPETS: Completion[] = [
  S("public static void main(String[] args) {\n\t${}\n}", { label: "main", detail: "main method", type: "function" }),
  S("System.out.println(${})",                 { label: "sout",   detail: "System.out.println",   type: "function" }),
  S("System.out.printf(\"${}\", ${});",        { label: "sof",    detail: "System.out.printf",    type: "function" }),
  S("for (int ${i} = 0; ${i} < ${n}; ${i}++) {\n\t${}\n}", { label: "for", detail: "for loop",   type: "keyword"  }),
  S("for (${Type} ${item} : ${array}) {\n\t${}\n}", { label: "fore", detail: "for-each",          type: "keyword"  }),
  S("if (${condition}) {\n\t${}\n}",           { label: "if",     detail: "if statement",          type: "keyword"  }),
  S("public class ${Name} {\n\t${}\n}",        { label: "cls",    detail: "class declaration",     type: "keyword"  }),
  S("public ${void} ${name}(${params}) {\n\t${}\n}", { label: "fn", detail: "method",             type: "keyword"  }),
  S("try {\n\t${}\n} catch (${Exception} ${e}) {\n\t${}\n}", { label: "try", detail: "try/catch", type: "keyword"  }),
  S("ArrayList<${String}> ${list} = new ArrayList<>();", { label: "al", detail: "ArrayList",       type: "class"    }),
  S("HashMap<${String}, ${Integer}> ${map} = new HashMap<>();", { label: "hm", detail: "HashMap", type: "class"    }),
];

const RUST_SNIPPETS: Completion[] = [
  S("fn main() {\n\t${}\n}",                  { label: "main",   detail: "main function",         type: "function" }),
  S("fn ${name}(${params}) -> ${type} {\n\t${}\n}", { label: "fn", detail: "function",            type: "keyword"  }),
  S("let ${name} = ${};",                      { label: "let",    detail: "let binding",           type: "keyword"  }),
  S("let mut ${name} = ${};",                  { label: "letm",   detail: "let mut binding",       type: "keyword"  }),
  S("println!(\"${}\", ${});",                 { label: "pl",     detail: "println!",              type: "function" }),
  S("for ${item} in ${iterator} {\n\t${}\n}", { label: "for",    detail: "for loop",               type: "keyword"  }),
  S("if ${condition} {\n\t${}\n}",             { label: "if",     detail: "if statement",           type: "keyword"  }),
  S("match ${value} {\n\t${pattern} => ${},\n\t_ => {},\n}", { label: "match", detail: "match expression", type: "keyword" }),
  S("struct ${Name} {\n\t${}\n}",              { label: "struct", detail: "struct",                 type: "keyword"  }),
  S("impl ${Name} {\n\t${}\n}",               { label: "impl",   detail: "impl block",             type: "keyword"  }),
  S("enum ${Name} {\n\t${}\n}",               { label: "enum",   detail: "enum",                   type: "keyword"  }),
  S("Vec::<${T}>::new()",                      { label: "vec",    detail: "Vec::new()",             type: "class"    }),
  S("if let Err(${e}) = ${expr} {\n\t${}\n}", { label: "iferr",  detail: "if let Err",             type: "keyword"  }),
  S("use ${};",                                { label: "use",    detail: "use statement",          type: "keyword"  }),
];

const GO_SNIPPETS: Completion[] = [
  S("func main() {\n\t${}\n}",                { label: "main",   detail: "main function",          type: "function" }),
  S("func ${name}(${params}) ${returnType} {\n\t${}\n}", { label: "fn", detail: "function",        type: "keyword"  }),
  S("fmt.Println(${})",                        { label: "pr",     detail: "fmt.Println",            type: "function" }),
  S("fmt.Printf(\"${}\", ${});",               { label: "prf",    detail: "fmt.Printf",             type: "function" }),
  S("for ${i} := 0; ${i} < ${n}; ${i}++ {\n\t${}\n}", { label: "for", detail: "for loop",         type: "keyword"  }),
  S("for ${k}, ${v} := range ${collection} {\n\t${}\n}", { label: "forr", detail: "range loop",    type: "keyword"  }),
  S("if ${condition} {\n\t${}\n}",             { label: "if",     detail: "if statement",           type: "keyword"  }),
  S("if err != nil {\n\treturn ${err}\n}",     { label: "ife",    detail: "error check",            type: "keyword"  }),
  S("type ${Name} struct {\n\t${}\n}",         { label: "str",    detail: "struct type",            type: "keyword"  }),
  S("go func() {\n\t${}\n}()",                 { label: "go",     detail: "goroutine",              type: "keyword"  }),
  S("ch := make(chan ${Type})",                 { label: "ch",     detail: "channel",               type: "keyword"  }),
  S("defer ${}",                               { label: "defer",  detail: "defer statement",        type: "keyword"  }),
  S(":= ${}",                                  { label: ":=",     detail: "short variable",         type: "keyword"  }),
];

const HTML_SNIPPETS: Completion[] = [
  S(`<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>\${title}</title>\n</head>\n<body>\n\t\${}\n</body>\n</html>`,
    { label: "html5", detail: "HTML5 boilerplate", type: "keyword" }),
  S('<div class="${}">\n\t${}\n</div>',        { label: "div",    detail: "<div>",                  type: "keyword"  }),
  S('<span class="${}">${}</span>',             { label: "span",   detail: "<span>",                 type: "keyword"  }),
  S('<a href="${}">${}</a>',                    { label: "a",      detail: "<a> link",               type: "keyword"  }),
  S('<img src="${}" alt="${}" />',              { label: "img",    detail: "<img>",                  type: "keyword"  }),
  S('<input type="${text}" placeholder="${}" />', { label: "inp",  detail: "<input>",               type: "keyword"  }),
  S('<button type="${button}">${}</button>',    { label: "btn",    detail: "<button>",               type: "keyword"  }),
  S('<form action="${}" method="${post}">\n\t${}\n</form>', { label: "form", detail: "<form>",        type: "keyword"  }),
  S('<link rel="stylesheet" href="${}" />',     { label: "link",   detail: "<link> stylesheet",      type: "keyword"  }),
  S('<script src="${}"></script>',              { label: "scr",    detail: "<script> src",           type: "keyword"  }),
  S('<p>${}</p>',                               { label: "p",      detail: "<p>",                   type: "keyword"  }),
  S('<ul>\n\t<li>${}</li>\n</ul>',             { label: "ul",     detail: "<ul>",                   type: "keyword"  }),
  S('<table>\n\t<tr>\n\t\t<th>${}</th>\n\t</tr>\n</table>', { label: "table", detail: "<table>",    type: "keyword"  }),
];

const SQL_SNIPPETS: Completion[] = [
  S("SELECT ${*} FROM ${table};",              { label: "sel",    detail: "SELECT",                 type: "keyword"  }),
  S("SELECT ${cols} FROM ${table} WHERE ${condition};", { label: "selw", detail: "SELECT…WHERE",    type: "keyword"  }),
  S("INSERT INTO ${table} (${cols}) VALUES (${vals});", { label: "ins",  detail: "INSERT INTO",      type: "keyword"  }),
  S("UPDATE ${table} SET ${col} = ${val} WHERE ${condition};", { label: "upd", detail: "UPDATE",    type: "keyword"  }),
  S("DELETE FROM ${table} WHERE ${condition};",{ label: "del",    detail: "DELETE",                 type: "keyword"  }),
  S("CREATE TABLE ${name} (\n\t${id} INT PRIMARY KEY,\n\t${}\n);", { label: "crt", detail: "CREATE TABLE", type: "keyword" }),
  S("SELECT ${cols} FROM ${t1} JOIN ${t2} ON ${t1}.${id} = ${t2}.${id};", { label: "join", detail: "JOIN", type: "keyword" }),
  S("SELECT ${col}, COUNT(*) FROM ${table} GROUP BY ${col};", { label: "grp", detail: "GROUP BY",  type: "keyword"  }),
];

const SHELL_SNIPPETS: Completion[] = [
  S("#!/bin/bash\n\n${}",                      { label: "shebang", detail: "bash shebang",          type: "keyword"  }),
  S('echo "${}";',                             { label: "echo",   detail: "echo",                   type: "function" }),
  S('if [ ${condition} ]; then\n\t${}\nfi',    { label: "if",     detail: "if statement",           type: "keyword"  }),
  S('for ${var} in ${list}; do\n\t${}\ndone', { label: "for",    detail: "for loop",                type: "keyword"  }),
  S('while [ ${condition} ]; do\n\t${}\ndone',{ label: "while",  detail: "while loop",              type: "keyword"  }),
  S('${name}() {\n\t${}\n}',                  { label: "fn",     detail: "function",                type: "keyword"  }),
  S('read -p "${prompt}" ${var}',              { label: "read",   detail: "read input",              type: "function" }),
  S('${var}=$(${command})',                    { label: "cmd",    detail: "command substitution",    type: "keyword"  }),
];

function getLanguageSnippets(language: string): Completion[] {
  switch (language) {
    case "javascript":
    case "typescript": return JS_SNIPPETS;
    case "python":
    case "python3":    return PY_SNIPPETS;
    case "cpp":
    case "c":          return CPP_SNIPPETS;
    case "java":       return JAVA_SNIPPETS;
    case "rust":       return RUST_SNIPPETS;
    case "go":         return GO_SNIPPETS;
    case "html":       return HTML_SNIPPETS;
    case "sql":        return SQL_SNIPPETS;
    case "bash":
    case "sh":
    case "shell":      return SHELL_SNIPPETS;
    default:           return [];
  }
}

function getSnippetSource(language: string) {
  const options = getLanguageSnippets(language);
  if (!options.length) return null;
  return (ctx: CompletionContext) => {
    const word = ctx.matchBefore(/\w+/);
    if (!word || (word.from === word.to && !ctx.explicit)) return null;
    const q = word.text.toLowerCase();
    const filtered = options.filter((o) => o.label.toLowerCase().startsWith(q));
    if (!filtered.length && !ctx.explicit) return null;
    return { from: word.from, options: filtered, validFor: /^\w*$/ };
  };
}

// ─── Light fallback highlight style ─────────────────────────────────────────

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

// ─── Language extension map ──────────────────────────────────────────────────

function getLanguageExtension(language: string) {
  switch (language) {
    case "javascript":
    case "typescript":  return javascript({ typescript: language === "typescript", jsx: true });
    case "python":
    case "python3":     return python();
    case "css":
    case "scss":        return css();
    case "html":        return html();
    case "json":        return json();
    case "markdown":    return markdown();
    case "sql":         return sql();
    case "rust":        return rust();
    case "java":        return java();
    case "cpp":
    case "c":           return cpp();
    case "php":         return php();
    case "xml":         return xml();
    case "go":          return StreamLanguage.define(go);
    case "bash":
    case "sh":
    case "shell":       return StreamLanguage.define(shell);
    case "ruby":
    case "rb":          return StreamLanguage.define(ruby);
    case "kotlin":
    case "kt":          return StreamLanguage.define(kotlin);
    case "swift":       return StreamLanguage.define(swift);
    case "yaml":
    case "yml":         return StreamLanguage.define(yaml);
    default:            return [];
  }
}

// ─── Theme extensions ────────────────────────────────────────────────────────

function getThemeExtensions(theme: string, fontFamily: string) {
  const themeExts = getEditorThemeExtensions(theme);
  if (themeExts.length > 0) return themeExts;
  // Fallback: default light theme
  return [
    EditorView.theme({
      "&": { backgroundColor: "hsl(220 14% 98%)", color: "#334155", fontFamily: `${fontFamily}, JetBrains Mono, monospace` },
      ".cm-content": { caretColor: "#7c3aed" },
      "&.cm-focused .cm-cursor": { borderLeftColor: "#7c3aed" },
      ".cm-gutters": { backgroundColor: "hsl(220 14% 94%)", color: "#94a3b8", borderRight: "1px solid hsl(220 13% 87%)" },
      ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 4px" },
      ".cm-activeLineGutter": { backgroundColor: "hsl(220 80% 95%)" },
      ".cm-activeLine": { backgroundColor: "hsl(220 80% 97%)" },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": { backgroundColor: "#bfdbfe" },
      ".cm-foldPlaceholder": { backgroundColor: "#e0e7ff", color: "#4338ca", border: "1px solid #c7d2fe" },
      ".cm-searchMatch": { backgroundColor: "#fef08a", outline: "1px solid #facc15" },
      ".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: "#fde047" },
      ".cm-tooltip": { backgroundColor: "hsl(220 14% 98%)", border: "1px solid hsl(220 13% 87%)" },
      ".cm-completionLabel": { color: "#334155" },
      ".cm-completionDetail": { color: "#64748b" },
    }),
    syntaxHighlighting(lightHighlightStyle),
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CodeEditor({ fileId, content, language, onChange, onCursorChange }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const contentRef = useRef(content);
  const { theme, fontSize, tabSize, wordWrap, lineNumbers: showLineNumbers, fontFamily, setFontSize } = useEditorStore();
  const fontSizeRef = useRef(fontSize);
  fontSizeRef.current = fontSize;

  const wordWrapComp   = useRef(new Compartment());
  const lineNumsComp   = useRef(new Compartment());
  const tabSizeComp    = useRef(new Compartment());
  const fontComp       = useRef(new Compartment());

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!editorRef.current) return;

    const langExt = getLanguageExtension(language);
    const snippetSource = getSnippetSource(language);

    const extensions = [
      history(),
      highlightSpecialChars(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      crosshairCursor(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      snippetSource
        ? autocompletion({ override: [snippetSource], activateOnTyping: true, closeOnBlur: false })
        : autocompletion({ activateOnTyping: true }),
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
        ...foldKeymap,
        { key: "Mod-/",         run: toggleComment },
        indentWithTab,
        { key: "Alt-ArrowUp",   run: moveLineUp },
        { key: "Alt-ArrowDown", run: moveLineDown },
      ]),
      wordWrapComp.current.of(wordWrap ? EditorView.lineWrapping : []),
      lineNumsComp.current.of(showLineNumbers ? lineNumbers() : []),
      tabSizeComp.current.of(EditorState.tabSize.of(tabSize)),
      fontComp.current.of(EditorView.theme({
        "&": { fontSize: `${fontSize}px`, fontFamily: `${fontFamily}, JetBrains Mono, monospace`, height: "100%" },
        ".cm-scroller": { fontFamily: "inherit", overflow: "auto", WebkitOverflowScrolling: "touch", touchAction: "pan-y" },
        ".cm-content": { touchAction: "pan-y" },
      })),
      // Mobile-friendly search panel
      EditorView.theme({
        ".cm-search": { fontSize: "14px", padding: "4px" },
        ".cm-search input": { fontSize: "14px", padding: "4px 8px", minHeight: "32px" },
        ".cm-search button": { fontSize: "13px", padding: "4px 10px", minHeight: "32px" },
        ".cm-search label": { fontSize: "13px" },
      }),
      ...getThemeExtensions(theme, fontFamily),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newContent = update.state.doc.toString();
          contentRef.current = newContent;
          onChangeRef.current(newContent);
        }
        if (update.selectionSet || update.docChanged) {
          if (onCursorChange) {
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            onCursorChange(line.number, pos - line.from + 1);
          }
        }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, language, theme]);

  useEffect(() => {
    if (!viewRef.current || content === contentRef.current) return;
    contentRef.current = content;
    viewRef.current.dispatch({
      changes: { from: 0, to: viewRef.current.state.doc.length, insert: content },
    });
  }, [fileId, content]);

  useEffect(() => {
    viewRef.current?.dispatch({ effects: wordWrapComp.current.reconfigure(wordWrap ? EditorView.lineWrapping : []) });
  }, [wordWrap]);

  useEffect(() => {
    viewRef.current?.dispatch({ effects: lineNumsComp.current.reconfigure(showLineNumbers ? lineNumbers() : []) });
  }, [showLineNumbers]);

  useEffect(() => {
    viewRef.current?.dispatch({ effects: tabSizeComp.current.reconfigure(EditorState.tabSize.of(tabSize)) });
  }, [tabSize]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: fontComp.current.reconfigure(EditorView.theme({
        "&": { fontSize: `${fontSize}px`, fontFamily: `${fontFamily}, JetBrains Mono, monospace`, height: "100%" },
        ".cm-scroller": { fontFamily: "inherit", overflow: "auto", WebkitOverflowScrolling: "touch", touchAction: "pan-y" },
        ".cm-content": { touchAction: "pan-y" },
      })),
    });
  }, [fontSize, fontFamily]);

  // Pinch-to-zoom
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    let initialDist = 0;
    let initialSize = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
        initialSize = fontSizeRef.current;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDist > 0) {
        e.preventDefault();
        const dist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
        const newSize = Math.min(Math.max(Math.round(initialSize * (dist / initialDist)), 10), 36);
        setFontSize(newSize);
      }
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => { el.removeEventListener("touchstart", onTouchStart); el.removeEventListener("touchmove", onTouchMove); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={editorRef} className="h-full w-full" style={{ overflow: "hidden" }} data-testid="code-editor" />
  );
}
