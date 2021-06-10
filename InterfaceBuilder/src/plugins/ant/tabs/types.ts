import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes"

export interface ITabsInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "tabs"
  defaultActiveKey: string
  onChangeData: UserInterfaceProps["onChangeData"]
  tabs?: ComponentDefinition[]
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
