import { RichTextEditorInterfaceComponent } from "../ckeditor/rich-text-editor/RichTextEditorInterfaceComponent"
import { ComponentRegistryCache } from "../../services/ComponentRegistry"

const plugin: ComponentRegistryCache = {
  "rich-text-editor": RichTextEditorInterfaceComponent,
}

export default plugin
