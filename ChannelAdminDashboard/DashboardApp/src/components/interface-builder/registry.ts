import React from "react"
import { BaseInterfaceComponent } from "./components/base/BaseInterfaceComponent"
import { SlotConfigInterfaceComponent } from "./components/custom/slot-config/SlotConfigInterfaceComponent"
import { CardInterfaceComponent } from "./components/display/card/CardInterfaceComponent"
import { CollapseInterfaceComponent } from "./components/display/collapse/CollapseInterfaceComponent"
import { ColumnInterfaceComponent } from "./components/display/column/ColumnInterfaceComponent"
import { ListInterfaceComponent } from "./components/display/list/ListInterfaceComponent"
import { SectionedNavigationInterfaceComponent } from "./components/display/sectioned-navigation/SectionedNavigationInterfaceComponent"
import { TableInterfaceComponent } from "./components/display/table/TableInterfaceComponent"
import { TabsInterfaceComponent } from "./components/display/tabs/TabsInterfaceComponent"
import { WizardInterfaceComponent } from "./components/display/wizard/WizardInterfaceComponent"
import { CheckboxInterfaceComponent } from "./components/form/checkbox/CheckboxInterfaceComponent"
import { DataMapInterfaceComponent } from "./components/form/data-map/DataMapInterfaceComponent"
import { DateRangeInterfaceComponent } from "./components/form/date-range/DateRangeInterfaceComponent"
import { DateInterfaceComponent } from "./components/form/date/DateInterfaceComponent"
import { FormInterfaceComponent } from "./components/form/FormInterfaceComponent"
import { InputInterfaceComponent } from "./components/form/input/InputInterfaceComponent"
import { PasswordInterfaceComponent } from "./components/form/password/PasswordInterfaceComponent"
import { TextAreaInterfaceComponent } from "./components/form/textarea/TextAreaInterfaceComponent"
import { NumberInputInterfaceComponent } from "./components/form/number-input/NumberInputInterfaceComponent"
import { NumberRangeInterfaceComponent } from "./components/form/number-range/NumberRangeInterfaceComponent"
import { ProgressInterfaceComponent } from "./components/display/progress/ProgressInterfaceComponent"
import { SelectInterfaceComponent } from "./components/form/select/SelectInterfaceComponent"
import { ToggleInterfaceComponent } from "./components/form/toggle/ToggleInterfaceComponent"
import { CodeEditorInterfaceComponent } from "./components/special/code-editor/CodeEditorInterfaceComponent"
import { QueryInterfaceComponent } from "./components/special/query/QueryInterfaceComponent"
import { RemoteComponentInterfaceComponent } from "./components/special/remote-component/RemoteComponentInterfaceComponent"
import { UploadInterfaceComponent } from "./components/form/upload/UploadInterfaceComponent"
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
    collapse: CollapseInterfaceComponent,
    column: ColumnInterfaceComponent,
    "data-map": DataMapInterfaceComponent,
    date: DateInterfaceComponent,
    "date-range": DateRangeInterfaceComponent,
    form: FormInterfaceComponent,
    input: InputInterfaceComponent,
    list: ListInterfaceComponent,
    "number-input": NumberInputInterfaceComponent,
    "number-range": NumberRangeInterfaceComponent,
    password: PasswordInterfaceComponent,
    progress: ProgressInterfaceComponent,
    query: QueryInterfaceComponent,
    "remote-component": RemoteComponentInterfaceComponent,
    "sectioned-navigation": SectionedNavigationInterfaceComponent,
    select: SelectInterfaceComponent,
    tabs: TabsInterfaceComponent,
    table: TableInterfaceComponent,
    textarea: TextAreaInterfaceComponent,
    toggle: ToggleInterfaceComponent,
    "user-interface": UserInterfaceInterfaceComponent,
    upload: UploadInterfaceComponent,
    wizard: WizardInterfaceComponent,

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
