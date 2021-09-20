import layoutDefinition from "./layoutDefinition"
import { RegisterableComponent } from "@opg/interface-builder"
import CodeEditorInterfaceComponent from "./CodeEditorInterfaceComponent"

export default { component: CodeEditorInterfaceComponent, layoutDefinition } as RegisterableComponent
export { CodeEditor } from "./components/CodeEditor"
export { editorLanguages, EditorLangCodec } from "./components/constants"
export { registerMonacoEditorMount } from "./registerMonacoEditorMount"
