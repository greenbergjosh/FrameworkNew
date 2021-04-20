import { CodeEditorInterfaceComponent } from "../../plugins/monaco/code-editor/CodeEditorInterfaceComponent"
import { ComponentRegistryCache } from "../../services/ComponentRegistry"

const plugin: ComponentRegistryCache = {
  "code-editor": CodeEditorInterfaceComponent,
}

export default plugin
