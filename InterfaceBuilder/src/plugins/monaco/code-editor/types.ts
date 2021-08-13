import { default as monacoEditor, editor, IDisposable } from "monaco-editor"
import { EditorProps } from "@monaco-editor/react"
import { Option } from "fp-ts/lib/Option"
import * as iots from "io-ts"
import { EditorLangCodec } from "plugins/monaco/code-editor/constants"
import { ComponentDefinitionNamedProps, UserInterfaceDataType, UserInterfaceProps } from "globalTypes"

export { CancellationToken, IDisposable, IPosition } from "monaco-editor"

export interface CodeEditorInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "code-editor"
  defaultLanguage: EditorLang
  defaultTheme: EditorTheme
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  autoSync: boolean
  height: string
  width: string
}

export interface CodeEditorInterfaceComponentState {
  document: UserInterfaceDataType
}

export type EditorTheme = "vs" | "vs-dark" | "hc-black"

export type EditorLang = iots.TypeOf<typeof EditorLangCodec>

export interface CodeEditorProps extends Required<Pick<EditorProps, "height" | "width">> {
  /** the read-only code to display */
  document: UserInterfaceDataType
  /** the text being edited */
  documentDraft: Option<UserInterfaceProps["data"]>
  theme?: EditorTheme
  language: EditorLang
  onChange?: (args: { value: UserInterfaceDataType; errors: Option<string[]> }) => void
  onMonacoInit?: (monacoInstance: typeof monacoEditor) => void
  editorDidMount?: (getEditorValue: () => string, editor: monacoEditor.editor.IStandaloneCodeEditor) => void
  outputType?: string
}

export type CustomEditorWillMount = (monaco: editor.IStandaloneCodeEditor) => IDisposable[]

export type MonacoEditorProps = {
  defaultValue: EditorProps["value"]
  options: editor.IEditorConstructionOptions
  originalValue: EditorProps["value"]
  value: EditorProps["value"]
}
