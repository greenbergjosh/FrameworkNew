import { Option } from "fp-ts/lib/Option";
import * as iots from "io-ts";
import { editor, IDisposable } from "monaco-editor";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import React from "react";
import { MonacoEditorProps } from "react-monaco-editor";
import IEditorConstructionOptions = editor.IEditorConstructionOptions;
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
interface Props extends Required<Pick<MonacoEditorProps, "height" | "width">> {
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
}
export declare type CustomEditorWillMount = (monaco: typeof monacoEditor) => IDisposable[];
export declare const registerMonacoEditorMount: (customEditorWillMount: CustomEditorWillMount) => void;
export declare const activeEditorSettings: NonNullable<IEditorConstructionOptions>;
/*******************************
 * CodeEditor Component
 */
export declare const CodeEditor: React.NamedExoticComponent<Props>;
export {};
//# sourceMappingURL=code-editor.d.ts.map