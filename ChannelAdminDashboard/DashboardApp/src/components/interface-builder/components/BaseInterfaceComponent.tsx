import React from "react"

export interface LayoutDefinition {
  /** A unique name for this component */
  name: string
  /** The display text of this component */
  title: string
  /** The AntDesign icon name of this component */
  icon?: string
}

export interface ComponentDefinition {
  component: string
  label?: string
  mode: "display" | "edit"
}

export abstract class BaseInterfaceComponent<
  T extends ComponentDefinition,
  Y = {}
> extends React.Component<T, Y> {
  static getLayoutDefinition(): LayoutDefinition {
    return { name: "__Undefined", title: "__Undefined" } as LayoutDefinition
  }
}
