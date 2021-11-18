import * as iots from "io-ts"
import { CancellationToken, default as monacoEditor, editor, IDisposable, IPosition, languages } from "monaco-editor"
import {
  AbstractBaseInterfaceComponentType,
  ComponentDefinitionNamedProps,
  UserInterfaceDataType,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { EditorLangCodec } from "./components/constants"
import { EditorProps } from "@monaco-editor/react"
import { Option } from "fp-ts/lib/Option"

export type { CancellationToken, IDisposable, IPosition }

export interface CodeEditorInterfaceComponentProps extends ComponentDefinitionNamedProps {
  autoSync: boolean
  component: "code-editor"
  defaultLanguage: EditorLang
  defaultTheme: EditorTheme
  defaultValue?: string
  height: string
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  showMinimap?: boolean
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  width: string
}

export interface CodeEditorInterfaceComponentState {
  internalDocument: UserInterfaceDataType
}

export interface ChangeManagerProps {
  autoSync: boolean
  defaultLanguage: EditorLang
  defaultTheme: EditorTheme
  defaultValue?: string
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  getValue: AbstractBaseInterfaceComponentType["prototype"]["getValue"]
  height: string
  internalDocument: UserInterfaceDataType
  mode: UserInterfaceProps["mode"]
  onEditorDocumentChange: (editorDocument: UserInterfaceDataType) => void
  onExternalDocumentChange: (externalDocument: UserInterfaceDataType) => void
  raiseEvent: AbstractBaseInterfaceComponentType["prototype"]["raiseEvent"]
  setValue: AbstractBaseInterfaceComponentType["prototype"]["setValue"]
  showMinimap?: boolean
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  width: string
}

export type EditorTheme = "vs" | "vs-dark" | "hc-black"

export type EditorLang = iots.TypeOf<typeof EditorLangCodec>

export interface CodeEditorProps extends Required<Pick<EditorProps, "height" | "width">> {
  document: UserInterfaceDataType
  documentDraft?: Option<UserInterfaceProps["data"]> // deprecated
  editorDidMount?: (getEditorValue: () => string, editor: monacoEditor.editor.IStandaloneCodeEditor) => void
  language: EditorLang
  mode: UserInterfaceProps["mode"]
  onChange?: (args: { value: UserInterfaceDataType; errors: Option<string[]> }) => void
  onMonacoInit?: (monacoInstance: typeof monacoEditor) => void
  original?: UserInterfaceDataType
  outputType?: string
  raiseEvent?: AbstractBaseInterfaceComponentType["prototype"]["raiseEvent"]
  showMinimap?: boolean
  theme?: EditorTheme
}

export type CustomEditorWillMount = (monaco: editor.IStandaloneCodeEditor) => IDisposable[]

export type GetCustomEditorWillMount = (
  registerLinkProvider: typeof languages.registerLinkProvider,
  registerHoverProvider: typeof languages.registerHoverProvider,
  Range: any
) => CustomEditorWillMount
