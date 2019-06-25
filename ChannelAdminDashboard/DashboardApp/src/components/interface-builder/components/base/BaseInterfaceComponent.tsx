import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { merge } from "lodash/fp"
import React from "react"
import { registry } from "../../registry"

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
  hidden?: boolean
  hideLabel?: boolean
  label?: string
  visibilityConditions?: JSONObject
}

export interface ComponentDefinitionRecursiveProp {
  [key: string]: ComponentDefinition[]
}

export type ComponentDefinition =
  | ComponentDefinitionNamedProps
  | ComponentDefinitionNamedProps & ComponentDefinitionRecursiveProp

export interface ComponentRenderMetaProps {
  // mode: UserInterfaceProps["mode"]
  userInterfaceData?: any
  onChangeData?: (newData: ChangeObject) => void
  onChangeState?: (newState: ChangeObject) => void
}

export type BaseInterfaceComponentProps = ComponentDefinition & ComponentRenderMetaProps

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
      return { [componentDefinition.valueKey]: componentDefinition.defaultValue }
    }
    return {}
  }
  static manageForm(...extend: ComponentDefinition[]): ComponentDefinition[] {
    return extend || []
  }
  static getManageFormDefaults(): { [key: string]: any } {
    return getDefaultsFromComponentDefinitions(this.manageForm())
  }
}

function getDefaultsFromComponentDefinitions(componentDefinitions: ComponentDefinition[]) {
  // Iterate over all the definitions to accumulate their defaults
  return componentDefinitions.reduce((acc, componentDefinition) => {
    // Check to see if there's a component type for this object
    const Component = registry.lookup(componentDefinition.component)
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

    // If this component has a value itself, get it
    const thisValue = (Component && Component.getDefintionDefaultValue(componentDefinition)) || {}

    // Combine the existing values with this level's value and any nested values
    return { ...acc, ...thisValue, ...nestedValues }
  }, {})
}
