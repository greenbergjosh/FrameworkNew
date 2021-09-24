import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"

export interface ITabsInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "tabs"
  defaultActiveKey: string
  onChangeData: UserInterfaceProps["onChangeData"]
  tabs?: ITab[]
  userInterfaceData?: UserInterfaceProps["data"]
}

interface TabsInterfaceComponentDisplayModeProps extends ITabsInterfaceComponentProps {
  mode: "display"
}
interface TabsInterfaceComponentEditModeProps extends ITabsInterfaceComponentProps {
  mode: "edit"
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}

export type TabsInterfaceComponentProps = TabsInterfaceComponentDisplayModeProps | TabsInterfaceComponentEditModeProps

export interface TabsInterfaceComponentDisplayModeState {
  activeTabKey: string | null
}

export enum EVENTS {
  ACTIVE_TAB_CHANGED = "activeTabChanged",
}

export interface ITab extends ComponentDefinitionNamedProps {
  tabKey: string
  components: ComponentDefinition[]
}
