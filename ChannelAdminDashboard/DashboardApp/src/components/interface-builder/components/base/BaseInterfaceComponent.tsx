import React from "react"
import { UserInterfaceProps } from "../../UserInterface"

export interface LayoutDefinition {
  /** A unique name for this component */
  name: string
  /** The display text of this component */
  title: string
  /** The AntDesign icon name of this component */
  icon?: string
  /** Whether or not this component is a form control */
  formControl?: boolean
  /** The initial ComponentDefinition when creating an instance of this*/
  componentDefinition: Partial<ComponentDefinition>
}

export interface ChangeObject {
  [key: string]: unknown
}

export interface ComponentDefinitionNamedProps {
  key: string
  component: string
  help?: string
  hideLabel?: boolean
  label?: string
}

export interface ComponentDefinitionRecursiveProp {
  [key: string]: ComponentDefinition[]
}

export type ComponentDefinition =
  | ComponentDefinitionNamedProps
  | ComponentDefinitionNamedProps & ComponentDefinitionRecursiveProp

export interface ComponentRenderMetaProps {
  // mode: UserInterfaceProps["mode"]
  onDataChanged?: (newState: ChangeObject) => void
  onStateChanged?: (newState: ChangeObject) => void
}

export type BaseInterfaceComponentProps = ComponentDefinition & ComponentRenderMetaProps

export abstract class BaseInterfaceComponent<
  T extends BaseInterfaceComponentProps,
  Y = {}
> extends React.Component<T, Y> {
  static getLayoutDefinition(): LayoutDefinition {
    return { name: "__Undefined", title: "__Undefined" } as LayoutDefinition
  }
  static manageForm(...extend: ComponentDefinition[]): ComponentDefinition[] {
    return extend || []
  }
}
