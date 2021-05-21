import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes"

export interface DataInjectorInterfaceComponentProps extends ComponentDefinitionNamedProps {
  // Core props
  component: "data-injector"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  preconfigured?: boolean
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string

  // Additional props
  jsonValue: string
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
