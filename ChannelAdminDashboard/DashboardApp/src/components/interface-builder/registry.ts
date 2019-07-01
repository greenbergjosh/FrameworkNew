import React from "react"
import { BaseInterfaceComponent } from "./components/base/BaseInterfaceComponent"
import { SlotConfigInterfaceComponent } from "./components/custom/slot-config/SlotConfigInterfaceComponent"
import { CardInterfaceComponent } from "./components/display/card/CardInterfaceComponent"
import { ListInterfaceComponent } from "./components/display/list/ListInterfaceComponent"
import { TableInterfaceComponent } from "./components/display/table/TableInterfaceComponent"
import { TabsInterfaceComponent } from "./components/display/tabs/TabsInterfaceComponent"
import { CheckboxInterfaceComponent } from "./components/form/checkbox/CheckboxInterfaceComponent"
import { DataMapInterfaceComponent } from "./components/form/data-map/DataMapInterfaceComponent"
import { DateRangeInterfaceComponent } from "./components/form/date-range/DateRangeInterfaceComponent"
import { FormInterfaceComponent } from "./components/form/FormInterfaceComponent"
import { InputInterfaceComponent } from "./components/form/input/InputInterfaceComponent"
import { SelectInterfaceComponent } from "./components/form/select/SelectInterfaceComponent"
import { ToggleInterfaceComponent } from "./components/form/toggle/ToggleInterfaceComponent"
import { CodeEditorInterfaceComponent } from "./components/special/code-editor/CodeEditorInterfaceComponent"
import { UserInterfaceInterfaceComponent } from "./components/special/user-interface/UserInterfaceInterfaceComponent"

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
    card: CardInterfaceComponent,
    checkbox: CheckboxInterfaceComponent,
    "code-editor": CodeEditorInterfaceComponent,
    "data-map": DataMapInterfaceComponent,
    "date-range": DateRangeInterfaceComponent,
    form: FormInterfaceComponent,
    input: InputInterfaceComponent,
    list: ListInterfaceComponent,
    select: SelectInterfaceComponent,
    tabs: TabsInterfaceComponent,
    table: TableInterfaceComponent,
    toggle: ToggleInterfaceComponent,
    "user-interface": UserInterfaceInterfaceComponent,

    // Custom items really should be added as a third party registration
    "slot-config": SlotConfigInterfaceComponent,
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
