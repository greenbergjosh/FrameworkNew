import { RouterInterfaceComponent } from "./router/RouterInterfaceComponent"
import { RouteInterfaceComponent } from "./route/RouteInterfaceComponent"
import { ComponentRegistryCache } from "../../services/ComponentRegistry"

const plugin: ComponentRegistryCache = {
  router: RouterInterfaceComponent,
  route: RouteInterfaceComponent,
}

export default plugin
