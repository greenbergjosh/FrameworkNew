import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
  JSONRecord,
} from "@opg/interface-builder"

export interface DataInjectorInterfaceComponentProps extends ComponentDefinitionNamedProps {
  // Core props
  component: "data-injector"
  components: ComponentDefinition[]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
  userInterfaceSchema: ComponentRenderMetaProps["userInterfaceSchema"]
  preconfigured?: boolean
  valueKey: string
  outboundValueKey: string

  // Additional props
  jsonValue: string | JSONRecord
  booleanValue: boolean
  numberValue: number
  stringValue: string
  dataType: "json" | "number" | "string" | "boolean"
  height: number
}

export interface DataInjectorInterfaceComponentState {
  text: string
}

export enum EVENTS {
  VALUE_CHANGED = "valueChanged",
}
