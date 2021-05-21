import { JSONRecord } from "../../../globalTypes/JSONTypes"
import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes"

export interface StringTemplateInterfaceComponentProps extends ComponentDefinitionNamedProps {
  // Core props
  component: "string-template"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  preconfigured?: boolean
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string

  // Additional props
  serializeSrc?: string
  deserializeSrc?: string
  serialize?: SerializeType
  deserialize?: DeserializeType
  showBorder?: boolean
}

export type SerializeType = (value?: JSONRecord | JSONRecord[]) => string | undefined
export type DeserializeType = (value?: string) => (JSONRecord | JSONRecord[]) | undefined

export interface StringTemplateInterfaceComponentState {
  serialize: SerializeType
  deserialize: DeserializeType
  data?: JSONRecord | JSONRecord[]
}
