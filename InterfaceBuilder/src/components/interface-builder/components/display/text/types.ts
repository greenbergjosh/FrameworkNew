import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

export interface TextInterfaceComponentProps extends ComponentDefinitionNamedProps {
  // Core props
  component: "text"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  preconfigured?: boolean
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string

  // Additional props
  stringTemplate: string
  useTokens: boolean
  textStyle: "text" | "paragraph" | "code" | "title"
}

export interface TextInterfaceComponentState {
  text: string | null
}

export interface TextDisplayProps {
  text: string | null
}
