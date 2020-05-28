import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

/**
 * Interleave:
 * As a list component, this describes in what manner to repeat, if there are multiple components.
 * "none" - There can only be a single component, it alone is repeated every time. (Default)
 * "round-robin" - Every component in the list is rotated through with each addition.
 * "set" - The entire set of components is repeated with each iteration.
 */
export type InterleaveType = "none" | "round-robin" | "set"

export type OrientationType = "horizontal" | "vertical"

export interface ListInterfaceComponentProps extends ComponentDefinitionNamedProps {
  addItemLabel: string
  allowDelete: boolean
  allowReorder: boolean
  component: "list"
  emptyText?: string
  orientation?: OrientationType
  interleave?: InterleaveType
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
  preconfigured?: boolean
  unwrappedList?: boolean
  unwrapped?: boolean
}

export interface ModeProps {
  data: any
  interleave?: InterleaveType
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
  orientation?: OrientationType
  unwrapped?: boolean
  unwrappedList?: boolean
}

export interface ListProps extends ModeProps {
  components: ComponentDefinition[]
}

export interface DisplayModeProps extends ModeProps {
  components: ComponentDefinition[]
  addItemLabel: string
  description?: string
}

export interface EditModeProps extends ModeProps {
  components: ComponentDefinition[]
  preconfigured?: boolean
}

export interface ListItemProps extends ModeProps {
  index: number
  component: ComponentDefinition
  listId: string
}
