import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  JSONRecord,
  UserInterfaceProps,
} from "@opg/interface-builder"

export interface RepeaterInterfaceComponentProps extends ComponentDefinitionNamedProps {
  allowDelete: boolean
  allowReorder: boolean
  component: "repeater"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

export interface ModeProps {
  components: ComponentDefinition[]
  data: JSONRecord[]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChange: (data: JSONRecord | JSONRecord[], subpath?: string) => void | undefined
}

/* *****************************************
 * CONFIG MODE
 */

export interface ConfigureModeProps extends ModeProps {}

/* *****************************************
 * DISPLAY MODE
 */

export interface DisplayModeProps extends ModeProps {}

export interface RepeaterProps {
  components: ComponentDefinition[]
  data: JSONRecord[]
  onChange: (data: JSONRecord | JSONRecord[], subpath?: string) => void
  userInterfaceData?: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
}

export interface RepeaterItemProps {
  components: ComponentDefinition[]
  itemData: JSONRecord
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  hasNextSibling: boolean
  index: number
  isDraggable: boolean
  onAddRow: (index: number) => void
  onChange: (index: number, itemData: JSONRecord) => void
  onDelete: (index: number) => void
  onMoveDown: (index: number) => void
  onMoveUp: (index: number) => void
}
