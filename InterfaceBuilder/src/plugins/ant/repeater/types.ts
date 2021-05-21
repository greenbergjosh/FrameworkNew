import { JSONRecord } from "../../../globalTypes/JSONTypes"
import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes"

export type OrientationType = "horizontal" | "vertical"

export interface RepeaterInterfaceComponentProps extends ComponentDefinitionNamedProps {
  addItemLabel: string
  allowDelete: boolean
  allowReorder: boolean
  component: "repeater"
  components: ComponentDefinition[]
  emptyText?: string
  hasInitialRecord?: boolean
  hasLastItemComponents?: boolean
  lastItemComponents?: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  orientation?: OrientationType
  preconfigured?: boolean
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
  readonly: boolean
}

export interface ModeProps {
  components: ComponentDefinition[]
  hasInitialRecord?: boolean
  hasLastItemComponents?: boolean
  lastItemComponents?: ComponentDefinition[]
  orientation?: OrientationType
  data: JSONRecord[]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"]
  onChange: (data: JSONRecord | JSONRecord[], subpath?: string) => void | undefined
}

/* *****************************************
 * CONFIG MODE
 */

export interface ConfigureModeProps extends ModeProps {
  preconfigured?: boolean
}

/* *****************************************
 * DISPLAY MODE
 */

export interface DisplayModeProps extends ModeProps {
  addItemLabel: string
  description?: string
  readonly: boolean
}

export interface RepeaterProps {
  components: ComponentDefinition[]
  data: JSONRecord[]
  hasInitialRecord?: boolean
  hasLastItemComponents?: boolean
  lastItemComponents?: ComponentDefinition[]
  onChange: (data: JSONRecord | JSONRecord[], subpath?: string) => void
  orientation?: OrientationType
  userInterfaceData?: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"]
  readonly: boolean
}

export interface RepeaterItemProps {
  components: ComponentDefinition[]
  itemData: JSONRecord
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"]
  hasNextSibling: boolean
  index: number
  isDraggable: boolean
  onAddRow: (index: number) => void
  onChange: (index: number, itemData: JSONRecord) => void
  onDelete: (index: number) => void
  onMoveDown: (index: number) => void
  onMoveUp: (index: number) => void
  readonly: boolean
}
