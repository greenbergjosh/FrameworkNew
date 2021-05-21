import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes"

export interface DevToolsInterfaceComponentProps extends ComponentDefinitionNamedProps {
  // Core props
  component: "text"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  preconfigured?: boolean
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string

  // Additional props
  height: number
}

export interface DevToolsInterfaceComponentState {
  showDataViewer: boolean
}
