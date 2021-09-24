import { Option } from "fp-ts/lib/Option";
import * as iots from "io-ts";
import { editor, IDisposable } from "monaco-editor";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import React from "react";
import { EditorProps } from "@monaco-editor/react";
export { supportedEditorTheme } from "./code-editor-manage-form";
/*******************************
 * Types & Interfaces
 */
export declare type EditorTheme = "vs" | "vs-dark" | "hc-black";
export declare type EditorLang = iots.TypeOf<typeof EditorLangCodec>;
export declare const editorLanguages: {
    csharp: "csharp";
    json: "json";
    javascript: "javascript";
    typescript: "typescript";
    sql: "sql";
};
export declare const EditorLangCodec: iots.KeyofC<{
    csharp: "csharp";
    json: "json";
    javascript: "javascript";
    typescript: "typescript";
    sql: "sql";
}>;
interface Props extends Required<Pick<EditorProps, "height" | "width">> {
    /** the read-only code to display */
    content: string;
    /** the text being edited */
    contentDraft: Option<string>;
    theme?: EditorTheme;
    language: EditorLang;
    onChange?: (x: {
        value: string;
        errors: Option<string[]>;
    }) => void;
    onMonacoInit?: (monacoInstance: typeof monacoEditor) => void;
    editorDidMount?: (getEditorValue: () => string, editor: monacoEditor.editor.IStandaloneCodeEditor) => void;
}
export declare type CustomEditorWillMount = (monaco: editor.IStandaloneCodeEditor) => IDisposable[];
export declare const registerMonacoEditorMount: (customEditorWillMount: CustomEditorWillMount) => void;
export declare const activeEditorSettings: NonNullable<editor.IEditorConstructionOptions>;
/*******************************
 * CodeEditor Component
 */
export declare const CodeEditor: React.NamedExoticComponent<Props>;
//# sourceMappingURL=code-editor.d.ts.map