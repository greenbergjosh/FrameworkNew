import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { merge, set } from "lodash/fp"
import React from "react"
import { registry } from "../../registry"
import { UserInterfaceProps } from "../../UserInterface"

export interface LayoutDefinition {
  /** A grouping of the component in the component selection */
  category: string
  /** A unique name for this component */
  name: string
  /** The display text of this component */
  title: string
  /** The AntDesign icon name of this component */
  icon?: string
  /** Whether or not this component is a form control */
  formControl?: boolean
  /** The initial ComponentDefinition when creating an instance of this */
  componentDefinition: Partial<ComponentDefinition>
}

export interface ChangeObject {
  [key: string]: unknown
}

export interface ComponentDefinitionNamedProps {
  key: string
  abstract?: boolean
  component: string
  defaultValue?: any
  help?: string
  hidden?: boolean
  hideLabel?: boolean
  label?: string
  visibilityConditions?: JSONObject
  [key: string]: unknown
}

export interface ComponentDefinitionRecursiveProp {
  [key: string]: ComponentDefinition[]
}

export type ComponentDefinition =
  | ComponentDefinitionNamedProps
  | ComponentDefinitionNamedProps & ComponentDefinitionRecursiveProp

export interface ComponentRenderMetaProps {
  mode?: UserInterfaceProps["mode"]
  userInterfaceData?: any
  onChangeData?: (newData: ChangeObject) => void
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}

export type BaseInterfaceComponentProps = ComponentDefinition & ComponentRenderMetaProps
export type BaseInterfaceComponentType = typeof BaseInterfaceComponent

export abstract class BaseInterfaceComponent<
  T extends BaseInterfaceComponentProps,
  Y = {}
> extends React.Component<T, Y> {
  static getLayoutDefinition(): LayoutDefinition {
    return { name: "__Undefined", title: "__Undefined" } as LayoutDefinition
  }
  static getDefintionDefaultValue(
    componentDefinition: ComponentDefinition & { valueKey?: string; defaultValue?: any }
  ): { [key: string]: any } {
    if (
      componentDefinition &&
      typeof componentDefinition.valueKey === "string" &&
      typeof componentDefinition.defaultValue !== "undefined"
    ) {
      return set(componentDefinition.valueKey, componentDefinition.defaultValue, {})
    }
    return {}
  }

  static manageForm(...extend: ComponentDefinition[]): ComponentDefinition[] {
    return extend || []
  }

  static getManageFormDefaults(): { [key: string]: any } {
    return getDefaultsFromComponentDefinitions(this.manageForm())
  }

  getDefaultValue(): unknown {
    if (typeof this.props.defaultValue !== "undefined") {
      return this.props.defaultValue
    } else {
      return ((this
        .constructor as unknown) as typeof BaseInterfaceComponent).getDefintionDefaultValue(
        this.props
      )
    }
  }
}

export function getDefaultsFromComponentDefinitions(componentDefinitions: ComponentDefinition[]) {
  // Iterate over all the definitions to accumulate their defaults
  return componentDefinitions.reduce((acc, componentDefinition) => {
    // If there are child lists of in the component's properties
    const nestedValues: { [key: string]: any } = Object.entries(componentDefinition).reduce(
      (acc2, [key, value]) => {
        if (Array.isArray(value) && value.length && value[0].component) {
          // Merge in child list values if they exist
          return merge(getDefaultsFromComponentDefinitions(value), acc2)
        }

        return acc2
      },
      {}
    )

    // Check to see if there's a component type for this object
    const Component = registry.lookup(componentDefinition.component)

    // If this component has a value itself, get it
    const thisValue = (Component && Component.getDefintionDefaultValue(componentDefinition)) || {}

    // Combine the existing values with this level's value and any nested values
    return merge(nestedValues, merge(thisValue, acc))
  }, {})
}