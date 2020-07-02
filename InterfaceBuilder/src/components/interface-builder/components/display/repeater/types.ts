import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"

export type OrientationType = "horizontal" | "vertical"

export interface RepeaterInterfaceComponentProps extends ComponentDefinitionNamedProps {
  hasInitialRecord?: boolean
  addItemLabel: string
  allowDelete: boolean
  allowReorder: boolean
  component: "repeater"
  components: ComponentDefinition[]
  emptyText?: string
  hasLastItemComponents?: boolean
  lastItemComponents?: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  orientation?: OrientationType
  preconfigured?: boolean
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

export interface ModeProps {
  components: ComponentDefinition[]
  hasInitialRecord?: boolean
  hasLastItemComponents?: boolean
  lastItemComponents?: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  orientation?: OrientationType
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

export interface ConfigureModeProps extends ModeProps {
  preconfigured?: boolean
}

export interface DisplayModeProps extends ModeProps {
  addItemLabel: string
  description?: string
}

export interface RepeaterProps extends ModeProps {
  data: JSONRecord
}

export interface RepeaterItemProps extends ModeProps {
  data: JSONRecord
  className?: string
  draganddropId: string
  index: number
  isDraggable: boolean
}
