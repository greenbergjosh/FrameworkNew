import React from "react"
import { BaseInterfaceComponent } from "./components/base/BaseInterfaceComponent"
import { CardInterfaceComponent } from "./components/display/card/CardInterfaceComponent"
import { CheckboxInterfaceComponent } from "./components/form/checkbox/CheckboxInterfaceComponent"
import { CodeEditorInterfaceComponent } from "./components/special/code-editor/CodeEditorInterfaceComponent"
import { CollapseInterfaceComponent } from "./components/display/collapse/CollapseInterfaceComponent"
import { ColumnInterfaceComponent } from "./components/display/column/ColumnInterfaceComponent"
import { DataMapInterfaceComponent } from "./components/form/data-map/DataMapInterfaceComponent"
import { DateInterfaceComponent } from "./components/form/date/DateInterfaceComponent"
import { DateRangeInterfaceComponent } from "./components/form/date-range/DateRangeInterfaceComponent"
import { FormInterfaceComponent } from "./components/form/FormInterfaceComponent"
import { InputInterfaceComponent } from "./components/form/input/InputInterfaceComponent"
import { ListInterfaceComponent } from "./components/display/list/ListInterfaceComponent"
import { NumberInputInterfaceComponent } from "./components/form/number-input/NumberInputInterfaceComponent"
import { NumberRangeInterfaceComponent } from "./components/form/number-range/NumberRangeInterfaceComponent"
import { PasswordInterfaceComponent } from "./components/form/password/PasswordInterfaceComponent"
import { ProgressInterfaceComponent } from "./components/display/progress/ProgressInterfaceComponent"
import { QueryInterfaceComponent } from "./components/special/query/QueryInterfaceComponent"
import { RemoteComponentInterfaceComponent } from "./components/special/remote-component/RemoteComponentInterfaceComponent"
import { RichTextEditorInterfaceComponent } from "./components/form/rich-text-editor/RichTextEditorInterfaceComponent"
import { SectionedNavigationInterfaceComponent } from "./components/display/sectioned-navigation/SectionedNavigationInterfaceComponent"
import { SelectInterfaceComponent } from "./components/form/select/SelectInterfaceComponent"
import { SlotConfigInterfaceComponent } from "./components/custom/slot-config/SlotConfigInterfaceComponent"
import { TableInterfaceComponent } from "./components/display/table/TableInterfaceComponent"
import { TabsInterfaceComponent } from "./components/display/tabs/TabsInterfaceComponent"
import { TagsInterfaceComponent } from "./components/form/tags/TagsInterfaceComponent"
import { TextAreaInterfaceComponent } from "./components/form/textarea/TextAreaInterfaceComponent"
import { ToggleInterfaceComponent } from "./components/form/toggle/ToggleInterfaceComponent"
import { UploadInterfaceComponent } from "./components/form/upload/UploadInterfaceComponent"
import { UserInterfaceInterfaceComponent } from "./components/special/user-interface/UserInterfaceInterfaceComponent"
import { WizardInterfaceComponent } from "./components/display/wizard/WizardInterfaceComponent"

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
    "rich-text-editor": RichTextEditorInterfaceComponent,
    "sectioned-navigation": SectionedNavigationInterfaceComponent,
    select: SelectInterfaceComponent,
    table: TableInterfaceComponent,
    tabs: TabsInterfaceComponent,
    tags: TagsInterfaceComponent,
    textarea: TextAreaInterfaceComponent,
    toggle: ToggleInterfaceComponent,
    upload: UploadInterfaceComponent,
    "user-interface": UserInterfaceInterfaceComponent,
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
