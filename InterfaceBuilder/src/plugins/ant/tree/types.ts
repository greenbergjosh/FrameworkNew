import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  IBaseInterfaceComponent,
  UserInterfaceProps,
} from "globalTypes"
import { TreeNodeNormal } from "antd/lib/tree/Tree"

export type EntryType = "standard" | "leaf" | "parent"

export interface TreeInterfaceComponentProps extends ComponentDefinitionNamedProps {
  addLabel: string
  addLeafLabel: string
  addParentLabel: string
  allowAdd?: boolean
  allowAddLeaves?: boolean
  allowAddParents?: boolean
  allowDetails?: boolean
  allowNestInLeaves?: boolean
  allowSelectParents?: boolean
  component: "tree"
  components: ComponentDefinition[]
  detailsOrientation?: "left" | "right" | "below"
  emptyText: string
  modifiable?: boolean
  onChangeData: UserInterfaceProps["onChangeData"]
  selectable?: boolean
  selectedKey?: string
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}
export interface ModeProps {
  components: ComponentDefinition[]
  data: TreeNodeNormal[]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  getValue: IBaseInterfaceComponent["getValue"]
  onChange: (treeData: TreeNodeNormal[]) => void
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  setValue: IBaseInterfaceComponent["setValue"]
  valueKey: string
}

export interface DisplayModeProps extends ModeProps {
  addLabel: string
  addLeafLabel: string
  addParentLabel: string
  allowAdd?: boolean
  allowAddLeaves?: boolean
  allowAddParents?: boolean
  allowDetails?: boolean
  allowNestInLeaves?: boolean
  allowSelectParents?: boolean
  component: "tree"
  detailsOrientation: TreeInterfaceComponentProps["detailsOrientation"]
  emptyText: string
  modifiable?: boolean
  selectable?: boolean
  selectedKey?: string
}
