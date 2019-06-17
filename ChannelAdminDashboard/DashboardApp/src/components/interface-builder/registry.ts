import React from "react"
import { BaseInterfaceComponent } from "./components/base/BaseInterfaceComponent"
import { TabsInterfaceComponent } from "./components/display/tabs/TabsInterfaceComponent"
import { CheckboxInterfaceComponent } from "./components/form/checkbox/CheckboxInterfaceComponent"
import { DateRangeInterfaceComponent } from "./components/form/date-range/DateRangeInterfaceComponent"
import { FormInterfaceComponent } from "./components/form/FormInterfaceComponent"
import { InputInterfaceComponent } from "./components/form/input/InputInterfaceComponent"
import { SelectInterfaceComponent } from "./components/form/select/SelectInterfaceComponent"

export interface ComponentRegistry {
  cache: ComponentRegistryCache
  lookup: (key: string) => typeof BaseInterfaceComponent
  register: (updatedRegistry: ComponentRegistryCache) => void
}

export interface ComponentRegistryCache {
  [key: string]: typeof BaseInterfaceComponent
}

export const registry: ComponentRegistry = {
  cache: {
    checkbox: CheckboxInterfaceComponent,
    "date-range": DateRangeInterfaceComponent,
    form: FormInterfaceComponent,
    input: InputInterfaceComponent,
    select: SelectInterfaceComponent,
    tabs: TabsInterfaceComponent,
  },
  lookup(key: string) {
    return registry.cache[key]
  },
  register(updatedRegistry: ComponentRegistryCache) {
    Object.entries(updatedRegistry).forEach(([key, component]) => (registry.cache[key] = component))
  },
}

export const ComponentRegistryContext = React.createContext<{
  componentRegistry: ComponentRegistry
}>({
  componentRegistry: registry,
})
