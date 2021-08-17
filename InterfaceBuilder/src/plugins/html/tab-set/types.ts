import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
  UserInterfaceProps,
} from "../../../globalTypes"
import { ITab } from "../../../plugins/html/tab/types"

export interface TabSetInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "tab-set"
  onChangeData: UserInterfaceProps["onChangeData"]
  tabs?: ITab[]
  userInterfaceData?: UserInterfaceProps["data"]
  userInterfaceSchema?: ComponentDefinition
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
  defaultActiveTabKey: string | null
}

export interface TabSetInterfaceComponentDisplayModeState {
  activeTabKey?: string | null
  availableTabs: string[]
  isUserInteracting: boolean
}

interface ModeProps {
  data: UserInterfaceProps["data"]
  defaultActiveTabKey: string | null
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  onChangeData?: (data: UserInterfaceProps["data"]) => void
  onChangeRootData: (newData: UserInterfaceProps["data"]) => void
  tabs?: ITab[]
}

export interface DisplayModeProps extends ModeProps {}

export interface EditModeProps extends ModeProps {}

export enum EVENTS {
  ACTIVE_TAB_CHANGED = "activeTabChanged",
}

export interface ITabSetContext {
  activeTabKey?: string | null
  setActiveTabKey: (key: string | null) => void
  availableTabs: string[]
  addAvailableTab: (key: string) => void
  isUserInteracting: boolean
  setUserInteracting: () => void
}
