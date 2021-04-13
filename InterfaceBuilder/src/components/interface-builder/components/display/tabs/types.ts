import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

export interface ITabsInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "tabs"
  defaultActiveKey: string
  onChangeData: UserInterfaceProps["onChangeData"]
  tabs?: ComponentDefinition[]
  userInterfaceData?: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
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
