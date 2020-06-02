import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"

export type OrientationType = "horizontal" | "vertical"

export interface RepeaterInterfaceComponentProps extends ComponentDefinitionNamedProps {
  addItemLabel: string
  allowDelete: boolean
  allowReorder: boolean
  component: "repeater"
  emptyText?: string
  orientation?: OrientationType
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
  preconfigured?: boolean
}

export interface ModeProps {
  data: JSONRecord
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
  orientation?: OrientationType
  components: ComponentDefinition[]
}

export interface RepeaterProps extends ModeProps {}

export interface DisplayModeProps extends ModeProps {
  addItemLabel: string
  description?: string
}

export interface ConfigureModeProps extends ModeProps {
  preconfigured?: boolean
}

export interface RepeaterItemProps extends ModeProps {
  index: number
  draganddropId: string
}
