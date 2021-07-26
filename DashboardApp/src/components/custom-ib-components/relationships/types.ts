import { ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"

export interface RelationshipsInterfaceComponentProps extends ComponentDefinitionNamedProps {
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
}

export interface RelationshipsInterfaceComponentState {
  configId?: string | null
}

export interface RelationshipTreeProps {
  configId?: string | null
}
