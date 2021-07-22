import { IFrameInterfaceComponent } from "./iframe/IFrameInterfaceComponent"
import { ContainerInterfaceComponent } from "./container/ContainerInterfaceComponent"
import { DataInjectorInterfaceComponent } from "./data-injector/DataInjectorInterfaceComponent"
import { ComponentRegistryCache } from "../../services/ComponentRegistry"
import { TabInterfaceComponent } from "./tab/TabInterfaceComponent"
import { TabSetInterfaceComponent } from "./tab-set/TabSetInterfaceComponent"

const plugin: ComponentRegistryCache = {
  iframe: IFrameInterfaceComponent,
  container: ContainerInterfaceComponent,
  "data-injector": DataInjectorInterfaceComponent,
  tab: TabInterfaceComponent,
  "tab-set": TabSetInterfaceComponent,
}

export default plugin
