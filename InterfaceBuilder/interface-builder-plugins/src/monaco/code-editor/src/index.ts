import layoutDefinition from "./layoutDefinition"
import { RegisterableComponent } from "@opg/interface-builder"
import CodeEditorInterfaceComponent from "./CodeEditorInterfaceComponent"

export default { component: CodeEditorInterfaceComponent, layoutDefinition } as RegisterableComponent
export { CodeEditor, supportedEditorTheme, editor, languages, Range } from "./CodeEditor"
export { editorLanguages, EditorLangCodec, registerMonacoEditorMount } from "./constants"
export * as CodeEditorTypes from "./types"
