import { IFrameInterfaceComponent } from "./iframe/IFrameInterfaceComponent"
import { ContainerInterfaceComponent } from "./container/ContainerInterfaceComponent"
import { DataInjectorInterfaceComponent } from "./data-injector/DataInjectorInterfaceComponent"
import { ComponentRegistryCache } from "../../services/ComponentRegistry"

const plugin: ComponentRegistryCache = {
  iframe: IFrameInterfaceComponent,
  container: ContainerInterfaceComponent,
  "data-injector": DataInjectorInterfaceComponent,
}

export default plugin
