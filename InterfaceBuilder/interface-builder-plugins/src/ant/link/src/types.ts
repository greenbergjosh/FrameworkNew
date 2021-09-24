import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"

type LinkType = "link" | "default" | "ghost" | "primary" | "dashed" | "danger" | undefined

export interface LinkInterfaceComponentProps extends ComponentDefinitionNamedProps {
  // Core props
  component: "text"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  preconfigured?: boolean
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string

  // Additional props
  useLinkLabelKey: boolean
  linkLabel: string
  linkLabelKey: string
  uri: string
  useUriTokens: boolean
  linkType: LinkType

  // Non-config props that can be provided by a wrapper component (non-interface builder use)
  onClick?: (uri: string) => void
}

export interface LinkInterfaceComponentState {
  linkLabel: string
  uri: string
}

export interface LinkDisplayProps {
  linkLabel: string
  uri: string
  disabled: boolean
  onClick?: (uri: string) => void
  linkType: LinkType
}
