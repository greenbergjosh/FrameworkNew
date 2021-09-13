import { editor } from "monaco-editor"
import * as iots from "io-ts"

/*******************************
 * Constants
 */

export const activeEditorSettings: NonNullable<editor.IEditorConstructionOptions> = {
  cursorBlinking: "blink",
  cursorSmoothCaretAnimation: false,
  cursorStyle: "block",
  extraEditorClassName: "",
  fixedOverflowWidgets: false,
  glyphMargin: false,
  lineDecorationsWidth: 10,
  lineNumbers: "on",
  lineNumbersMinChars: 4,
  minimap: {
    enabled: false,
  },
  mouseWheelZoom: false,
  overviewRulerBorder: false,
  overviewRulerLanes: 2,
  quickSuggestions: {
    comments: true,
    other: true,
    strings: true,
  },
  readOnly: false,
  renderFinalNewline: true,
  renderLineHighlight: "none",
  revealHorizontalRightPadding: 30,
  roundedSelection: true,
  rulers: [],
  scrollBeyondLastLine: false,
  selectionClipboard: true,
  selectOnLineNumbers: true,
  showUnused: true,
  snippetSuggestions: "none",
  // @ts-ignore
  wordBasedSuggestions: false,
  wordWrap: "off",
  wordWrapColumn: 80,
  wrappingIndent: "same",
}

export const editorLanguages = {
  csharp: "csharp" as const,
  json: "json" as const,
  javascript: "javascript" as const,
  typescript: "typescript" as const,
  sql: "sql" as const,
}

export const inactiveEditorSettings: NonNullable<editor.IEditorConstructionOptions> = {
  ...activeEditorSettings,
  readOnly: true,
}

export const diffEditorSettings = {
  ...activeEditorSettings,
  renderSideBySide: true,
}

export const EditorLangCodec = iots.keyof(editorLanguages)
