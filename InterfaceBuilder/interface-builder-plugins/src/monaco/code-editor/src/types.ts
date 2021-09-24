import * as iots from "io-ts"
import { CancellationToken, default as monacoEditor, editor, IDisposable, IPosition, languages } from "monaco-editor"
import {
  ComponentDefinitionNamedProps,
  UserInterfaceDataType,
  UserInterfaceProps,
  AbstractBaseInterfaceComponentType,
} from "@opg/interface-builder"
import { EditorLangCodec } from "./components/constants"
import { EditorProps } from "@monaco-editor/react"
import { Option } from "fp-ts/lib/Option"

export type { CancellationToken, IDisposable, IPosition }

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
  showMinimap?: boolean
}

export interface CodeEditorInterfaceComponentState {
  document: UserInterfaceDataType
}

export type EditorTheme = "vs" | "vs-dark" | "hc-black"

export type EditorLang = iots.TypeOf<typeof EditorLangCodec>

export interface CodeEditorProps extends Required<Pick<EditorProps, "height" | "width">> {
  original?: UserInterfaceDataType
  document: UserInterfaceDataType
  documentDraft?: Option<UserInterfaceProps["data"]> // deprecated
  theme?: EditorTheme
  language: EditorLang
  onChange?: (args: { value: UserInterfaceDataType; errors: Option<string[]> }) => void
  onMonacoInit?: (monacoInstance: typeof monacoEditor) => void
  editorDidMount?: (getEditorValue: () => string, editor: monacoEditor.editor.IStandaloneCodeEditor) => void
  outputType?: string
  raiseEvent?: AbstractBaseInterfaceComponentType["prototype"]["raiseEvent"]
  showMinimap?: boolean
}

export type CustomEditorWillMount = (monaco: editor.IStandaloneCodeEditor) => IDisposable[]

export type MonacoEditorProps = {
  defaultValue: EditorProps["value"]
  options: editor.IEditorConstructionOptions
  originalValue: EditorProps["value"]
}

export type GetCustomEditorWillMount = (
  registerLinkProvider: typeof languages.registerLinkProvider,
  registerHoverProvider: typeof languages.registerHoverProvider,
  Range: any
) => CustomEditorWillMount
