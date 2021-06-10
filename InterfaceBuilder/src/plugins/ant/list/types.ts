import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  IBaseInterfaceComponent,
  UserInterfaceProps,
} from "../../../globalTypes"

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
  unwrapped?: boolean
  style: string
}

export interface ModeProps {
  data: any
  interleave?: InterleaveType
  unwrapped?: boolean
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  getValue: IBaseInterfaceComponent["getValue"]
  setValue: IBaseInterfaceComponent["setValue"]
  valueKey: string
}

export interface DisplayModeProps extends ModeProps {
  addItemLabel: string
  components: ComponentDefinition[]
  description?: string
  listId: string
  orientation?: OrientationType
  userInterfaceData: UserInterfaceProps["data"]
}

export interface EditModeProps extends ModeProps {
  components: ComponentDefinition[]
  preconfigured?: boolean
}

export interface DraggableListItemProps extends ModeProps {
  index: number
  component: ComponentDefinition
  listId: string
  userInterfaceData: UserInterfaceProps["data"]
}

export interface ListItemProps extends ModeProps {
  index: number
  component: ComponentDefinition
  userInterfaceData: UserInterfaceProps["data"]
}
