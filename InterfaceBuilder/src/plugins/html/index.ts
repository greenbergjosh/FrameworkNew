import { IFrameInterfaceComponent } from "../../plugins/html/iframe/IFrameInterfaceComponent"
import { DataInjectorInterfaceComponent } from "../../plugins/html/data-injector/DataInjectorInterfaceComponent"
import { ComponentRegistryCache } from "../../services/ComponentRegistry"

const plugin: ComponentRegistryCache = {
  iframe: IFrameInterfaceComponent,
  "data-injector": DataInjectorInterfaceComponent,
}

export default plugin
