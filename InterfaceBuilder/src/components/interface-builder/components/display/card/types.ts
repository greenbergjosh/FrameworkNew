import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

export interface ICardInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "card"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  preconfigured?: boolean
  userInterfaceData?: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]

  bordered?: boolean
  extra?: string
  hoverable?: boolean
  inset?: boolean
  size?: "small" | "default"
  title?: string
}

interface CardInterfaceComponentDisplayModeProps extends ICardInterfaceComponentProps {
  mode: "display"
}

interface CardInterfaceComponentEditModeProps extends ICardInterfaceComponentProps {
  mode: "edit"
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}

export type CardInterfaceComponentProps = CardInterfaceComponentDisplayModeProps | CardInterfaceComponentEditModeProps
