import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { JSONRecord } from "index"

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
}

export type SerializeType = (value?: JSONRecord | JSONRecord[]) => string | undefined
export type DeserializeType = (value?: string) => (JSONRecord | JSONRecord[]) | undefined

export interface StringTemplateInterfaceComponentState {
  serialize: SerializeType
  deserialize: DeserializeType
  data?: JSONRecord | JSONRecord[]
}
