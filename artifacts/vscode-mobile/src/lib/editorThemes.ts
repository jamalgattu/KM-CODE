import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { oneDark } from "@codemirror/theme-one-dark";
import type { Extension } from "@codemirror/state";

export interface ThemeDef {
  id: string;
  name: string;
  dark: boolean;
}

export const EDITOR_THEMES: ThemeDef[] = [
  { id: "dark",        name: "One Dark",         dark: true  },
  { id: "dracula",     name: "Dracula",           dark: true  },
  { id: "monokai",     name: "Monokai",           dark: true  },
  { id: "nord",        name: "Nord",              dark: true  },
  { id: "github-dark", name: "GitHub Dark",       dark: true  },
  { id: "catppuccin",  name: "Catppuccin Mocha",  dark: true  },
  { id: "light",       name: "Default Light",     dark: false },
  { id: "solarized",   name: "Solarized Light",   dark: false },
  { id: "github-light",name: "GitHub Light",      dark: false },
];

export const DARK_THEME_IDS = new Set(
  EDITOR_THEMES.filter((t) => t.dark).map((t) => t.id)
);

const draculaTheme = EditorView.theme({
  "&":  { backgroundColor: "#282a36", color: "#f8f8f2" },
  ".cm-content": { caretColor: "#f8f8f2" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "#f8f8f2" },
  ".cm-gutters": { backgroundColor: "#21222c", color: "#6272a4", border: "none" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 4px" },
  ".cm-activeLineGutter": { backgroundColor: "#44475a" },
  ".cm-activeLine": { backgroundColor: "#44475a40" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": { backgroundColor: "#44475a" },
  ".cm-searchMatch": { backgroundColor: "#f1fa8c40", outline: "1px solid #f1fa8c" },
  ".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: "#f1fa8c80" },
  ".cm-foldPlaceholder": { backgroundColor: "#44475a", color: "#bd93f9", border: "1px solid #6272a4" },
  ".cm-tooltip": { backgroundColor: "#44475a", border: "1px solid #6272a4" },
  ".cm-completionLabel": { color: "#f8f8f2" },
  ".cm-completionDetail": { color: "#6272a4" },
}, { dark: true });
const draculaHighlight = HighlightStyle.define([
  { tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword, tags.moduleKeyword, tags.operatorKeyword], color: "#ff79c6" },
  { tag: [tags.string, tags.special(tags.string)], color: "#f1fa8c" },
  { tag: [tags.number, tags.bool, tags.null, tags.atom], color: "#bd93f9" },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: "#6272a4", fontStyle: "italic" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "#50fa7b" },
  { tag: tags.definition(tags.variableName), color: "#8be9fd" },
  { tag: tags.variableName, color: "#f8f8f2" },
  { tag: tags.propertyName, color: "#66d9ef" },
  { tag: [tags.className, tags.typeName, tags.namespace], color: "#8be9fd" },
  { tag: tags.operator, color: "#ff79c6" },
  { tag: [tags.tagName], color: "#ff79c6", fontWeight: "bold" },
  { tag: tags.attributeName, color: "#50fa7b" },
  { tag: tags.attributeValue, color: "#f1fa8c" },
  { tag: tags.regexp, color: "#8be9fd" },
  { tag: tags.escape, color: "#ffb86c" },
  { tag: tags.url, color: "#8be9fd", textDecoration: "underline" },
  { tag: [tags.heading], color: "#bd93f9", fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold" },
]);

const monokaiTheme = EditorView.theme({
  "&": { backgroundColor: "#272822", color: "#f8f8f2" },
  ".cm-content": { caretColor: "#f8f8f2" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "#f8f8f2" },
  ".cm-gutters": { backgroundColor: "#1e1f1c", color: "#75715e", border: "none" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 4px" },
  ".cm-activeLineGutter": { backgroundColor: "#3e3d32" },
  ".cm-activeLine": { backgroundColor: "#3e3d3250" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": { backgroundColor: "#49483e" },
  ".cm-searchMatch": { backgroundColor: "#e6db7440", outline: "1px solid #e6db74" },
  ".cm-foldPlaceholder": { backgroundColor: "#49483e", color: "#ae81ff", border: "1px solid #75715e" },
  ".cm-tooltip": { backgroundColor: "#3e3d32", border: "1px solid #75715e" },
  ".cm-completionLabel": { color: "#f8f8f2" },
  ".cm-completionDetail": { color: "#75715e" },
}, { dark: true });
const monokaiHighlight = HighlightStyle.define([
  { tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword, tags.moduleKeyword, tags.operatorKeyword], color: "#f92672" },
  { tag: [tags.string, tags.special(tags.string)], color: "#e6db74" },
  { tag: [tags.number, tags.bool, tags.null, tags.atom], color: "#ae81ff" },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: "#75715e", fontStyle: "italic" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "#a6e22e" },
  { tag: tags.definition(tags.variableName), color: "#a6e22e" },
  { tag: tags.variableName, color: "#f8f8f2" },
  { tag: tags.propertyName, color: "#66d9ef" },
  { tag: [tags.className, tags.typeName, tags.namespace], color: "#a6e22e" },
  { tag: tags.operator, color: "#f92672" },
  { tag: tags.tagName, color: "#f92672", fontWeight: "bold" },
  { tag: tags.attributeName, color: "#a6e22e" },
  { tag: tags.attributeValue, color: "#e6db74" },
  { tag: tags.regexp, color: "#f92672" },
  { tag: tags.escape, color: "#ae81ff" },
  { tag: [tags.heading], color: "#f92672", fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold" },
]);

const nordTheme = EditorView.theme({
  "&": { backgroundColor: "#2e3440", color: "#d8dee9" },
  ".cm-content": { caretColor: "#d8dee9" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "#d8dee9" },
  ".cm-gutters": { backgroundColor: "#2e3440", color: "#4c566a", border: "none" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 4px" },
  ".cm-activeLineGutter": { backgroundColor: "#3b4252" },
  ".cm-activeLine": { backgroundColor: "#3b425250" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": { backgroundColor: "#434c5e" },
  ".cm-searchMatch": { backgroundColor: "#ebcb8b40", outline: "1px solid #ebcb8b" },
  ".cm-foldPlaceholder": { backgroundColor: "#434c5e", color: "#88c0d0", border: "1px solid #4c566a" },
  ".cm-tooltip": { backgroundColor: "#3b4252", border: "1px solid #4c566a" },
  ".cm-completionLabel": { color: "#d8dee9" },
  ".cm-completionDetail": { color: "#4c566a" },
}, { dark: true });
const nordHighlight = HighlightStyle.define([
  { tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword, tags.moduleKeyword, tags.operatorKeyword], color: "#81a1c1" },
  { tag: [tags.string, tags.special(tags.string)], color: "#a3be8c" },
  { tag: [tags.number, tags.bool, tags.null, tags.atom], color: "#b48ead" },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: "#4c566a", fontStyle: "italic" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "#88c0d0" },
  { tag: tags.definition(tags.variableName), color: "#8fbcbb" },
  { tag: tags.variableName, color: "#d8dee9" },
  { tag: tags.propertyName, color: "#88c0d0" },
  { tag: [tags.className, tags.typeName, tags.namespace], color: "#8fbcbb" },
  { tag: tags.operator, color: "#81a1c1" },
  { tag: tags.tagName, color: "#81a1c1", fontWeight: "bold" },
  { tag: tags.attributeName, color: "#8fbcbb" },
  { tag: tags.attributeValue, color: "#a3be8c" },
  { tag: tags.regexp, color: "#ebcb8b" },
  { tag: [tags.heading], color: "#5e81ac", fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold" },
]);

const githubDarkTheme = EditorView.theme({
  "&": { backgroundColor: "#0d1117", color: "#c9d1d9" },
  ".cm-content": { caretColor: "#c9d1d9" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "#c9d1d9" },
  ".cm-gutters": { backgroundColor: "#0d1117", color: "#8b949e", borderRight: "1px solid #21262d" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 4px" },
  ".cm-activeLineGutter": { backgroundColor: "#161b22" },
  ".cm-activeLine": { backgroundColor: "#161b2280" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": { backgroundColor: "#264f78" },
  ".cm-searchMatch": { backgroundColor: "#ffa65740", outline: "1px solid #ffa657" },
  ".cm-foldPlaceholder": { backgroundColor: "#21262d", color: "#79c0ff", border: "1px solid #30363d" },
  ".cm-tooltip": { backgroundColor: "#161b22", border: "1px solid #30363d" },
  ".cm-completionLabel": { color: "#c9d1d9" },
  ".cm-completionDetail": { color: "#8b949e" },
}, { dark: true });
const githubDarkHighlight = HighlightStyle.define([
  { tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword, tags.moduleKeyword, tags.operatorKeyword], color: "#ff7b72" },
  { tag: [tags.string, tags.special(tags.string)], color: "#a5d6ff" },
  { tag: [tags.number, tags.bool, tags.null, tags.atom], color: "#79c0ff" },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: "#8b949e", fontStyle: "italic" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "#d2a8ff" },
  { tag: tags.definition(tags.variableName), color: "#c9d1d9" },
  { tag: tags.variableName, color: "#ffa657" },
  { tag: tags.propertyName, color: "#79c0ff" },
  { tag: [tags.className, tags.typeName, tags.namespace], color: "#ffa657" },
  { tag: tags.operator, color: "#ff7b72" },
  { tag: tags.tagName, color: "#7ee787", fontWeight: "bold" },
  { tag: tags.attributeName, color: "#79c0ff" },
  { tag: tags.attributeValue, color: "#a5d6ff" },
  { tag: tags.regexp, color: "#a5d6ff" },
  { tag: [tags.heading], color: "#79c0ff", fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold" },
]);

const catppuccinTheme = EditorView.theme({
  "&": { backgroundColor: "#1e1e2e", color: "#cdd6f4" },
  ".cm-content": { caretColor: "#cdd6f4" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "#cdd6f4" },
  ".cm-gutters": { backgroundColor: "#181825", color: "#6c7086", border: "none" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 4px" },
  ".cm-activeLineGutter": { backgroundColor: "#313244" },
  ".cm-activeLine": { backgroundColor: "#31324450" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": { backgroundColor: "#45475a" },
  ".cm-searchMatch": { backgroundColor: "#f9e2af40", outline: "1px solid #f9e2af" },
  ".cm-foldPlaceholder": { backgroundColor: "#313244", color: "#cba6f7", border: "1px solid #45475a" },
  ".cm-tooltip": { backgroundColor: "#313244", border: "1px solid #45475a" },
  ".cm-completionLabel": { color: "#cdd6f4" },
  ".cm-completionDetail": { color: "#6c7086" },
}, { dark: true });
const catppuccinHighlight = HighlightStyle.define([
  { tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword, tags.moduleKeyword, tags.operatorKeyword], color: "#cba6f7" },
  { tag: [tags.string, tags.special(tags.string)], color: "#a6e3a1" },
  { tag: [tags.number, tags.bool, tags.null, tags.atom], color: "#fab387" },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: "#6c7086", fontStyle: "italic" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "#89b4fa" },
  { tag: tags.definition(tags.variableName), color: "#cdd6f4" },
  { tag: tags.variableName, color: "#f38ba8" },
  { tag: tags.propertyName, color: "#89dceb" },
  { tag: [tags.className, tags.typeName, tags.namespace], color: "#f9e2af" },
  { tag: tags.operator, color: "#89b4fa" },
  { tag: tags.tagName, color: "#f38ba8", fontWeight: "bold" },
  { tag: tags.attributeName, color: "#89b4fa" },
  { tag: tags.attributeValue, color: "#a6e3a1" },
  { tag: tags.regexp, color: "#f38ba8" },
  { tag: [tags.heading], color: "#cba6f7", fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold" },
]);

const solarizedLightTheme = EditorView.theme({
  "&": { backgroundColor: "#fdf6e3", color: "#657b83" },
  ".cm-content": { caretColor: "#657b83" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "#657b83" },
  ".cm-gutters": { backgroundColor: "#eee8d5", color: "#93a1a1", borderRight: "1px solid #d3d0c8" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 4px" },
  ".cm-activeLineGutter": { backgroundColor: "#e8e0cc" },
  ".cm-activeLine": { backgroundColor: "#eee8d5" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": { backgroundColor: "#c0d9ff" },
  ".cm-searchMatch": { backgroundColor: "#c5b60a40", outline: "1px solid #c5b60a" },
  ".cm-foldPlaceholder": { backgroundColor: "#eee8d5", color: "#268bd2", border: "1px solid #d3d0c8" },
  ".cm-tooltip": { backgroundColor: "#eee8d5", border: "1px solid #d3d0c8" },
  ".cm-completionLabel": { color: "#657b83" },
  ".cm-completionDetail": { color: "#93a1a1" },
}, { dark: false });
const solarizedLightHighlight = HighlightStyle.define([
  { tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword, tags.moduleKeyword, tags.operatorKeyword], color: "#859900" },
  { tag: [tags.string, tags.special(tags.string)], color: "#2aa198" },
  { tag: [tags.number, tags.bool, tags.null, tags.atom], color: "#d33682" },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: "#93a1a1", fontStyle: "italic" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "#268bd2" },
  { tag: tags.definition(tags.variableName), color: "#268bd2" },
  { tag: tags.variableName, color: "#657b83" },
  { tag: tags.propertyName, color: "#268bd2" },
  { tag: [tags.className, tags.typeName, tags.namespace], color: "#cb4b16" },
  { tag: tags.operator, color: "#859900" },
  { tag: tags.tagName, color: "#268bd2", fontWeight: "bold" },
  { tag: tags.attributeName, color: "#93a1a1" },
  { tag: tags.attributeValue, color: "#2aa198" },
  { tag: [tags.heading], color: "#268bd2", fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold" },
]);

const githubLightTheme = EditorView.theme({
  "&": { backgroundColor: "#ffffff", color: "#24292f" },
  ".cm-content": { caretColor: "#24292f" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "#24292f" },
  ".cm-gutters": { backgroundColor: "#f6f8fa", color: "#8c959f", borderRight: "1px solid #d0d7de" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 4px" },
  ".cm-activeLineGutter": { backgroundColor: "#eaf5fb" },
  ".cm-activeLine": { backgroundColor: "#f6f8fa" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": { backgroundColor: "#b6d4fe" },
  ".cm-searchMatch": { backgroundColor: "#ffe06640", outline: "1px solid #ffe066" },
  ".cm-foldPlaceholder": { backgroundColor: "#f6f8fa", color: "#0969da", border: "1px solid #d0d7de" },
  ".cm-tooltip": { backgroundColor: "#f6f8fa", border: "1px solid #d0d7de" },
  ".cm-completionLabel": { color: "#24292f" },
  ".cm-completionDetail": { color: "#8c959f" },
}, { dark: false });
const githubLightHighlight = HighlightStyle.define([
  { tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword, tags.moduleKeyword, tags.operatorKeyword], color: "#cf222e" },
  { tag: [tags.string, tags.special(tags.string)], color: "#0a3069" },
  { tag: [tags.number, tags.bool, tags.null, tags.atom], color: "#0550ae" },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: "#8c959f", fontStyle: "italic" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "#8250df" },
  { tag: tags.definition(tags.variableName), color: "#24292f" },
  { tag: tags.variableName, color: "#e16209" },
  { tag: tags.propertyName, color: "#0550ae" },
  { tag: [tags.className, tags.typeName, tags.namespace], color: "#e16209" },
  { tag: tags.operator, color: "#cf222e" },
  { tag: tags.tagName, color: "#116329", fontWeight: "bold" },
  { tag: tags.attributeName, color: "#0550ae" },
  { tag: tags.attributeValue, color: "#0a3069" },
  { tag: [tags.heading], color: "#0550ae", fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold" },
]);

export function getEditorThemeExtensions(themeId: string): Extension[] {
  switch (themeId) {
    case "dark":        return [oneDark];
    case "dracula":     return [draculaTheme,       syntaxHighlighting(draculaHighlight)];
    case "monokai":     return [monokaiTheme,        syntaxHighlighting(monokaiHighlight)];
    case "nord":        return [nordTheme,           syntaxHighlighting(nordHighlight)];
    case "github-dark": return [githubDarkTheme,     syntaxHighlighting(githubDarkHighlight)];
    case "catppuccin":  return [catppuccinTheme,     syntaxHighlighting(catppuccinHighlight)];
    case "solarized":   return [solarizedLightTheme, syntaxHighlighting(solarizedLightHighlight)];
    case "github-light":return [githubLightTheme,    syntaxHighlighting(githubLightHighlight)];
    default:            return [];
  }
}
