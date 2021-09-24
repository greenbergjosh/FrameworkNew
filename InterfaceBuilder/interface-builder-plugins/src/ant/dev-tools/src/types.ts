import { ComponentDefinition, ComponentDefinitionNamedProps } from "@opg/interface-builder"

export interface DevToolsInterfaceComponentProps extends ComponentDefinitionNamedProps {
  // Core props
  component: "text"
  components: ComponentDefinition[]
  preconfigured?: boolean
  valueKey: string

  // Additional props
  height: number
}

export interface DevToolsInterfaceComponentState {
  showDataViewer: boolean
}
