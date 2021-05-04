import React from "react"
import { EventPayloadType } from "../../services/EventBus"
import { getValue } from "../../lib/getValue"
import { isUndefined, set } from "lodash/fp"
import { v4 as uuid } from "uuid"
import { ComponentDefinition, LayoutDefinition } from "../../globalTypes"
import { BaseInterfaceComponentProps, GetMergedData, GetValue, SetValue } from "./types"
import { getDefaultsFromComponentDefinitions } from "./componentDefinitionUtils"

/* TODO: Create an eventManager HOC to provide an onRaiseEvent prop for all components */
/**
 * BaseInterfaceComponent
 *
 * Events:
 * @static availableEvents: string[] - Add event names to raise in the component to this array
 * @method raiseEvent - Raise events by calling this method with an event name and a payload
 */
export abstract class BaseInterfaceComponent<T extends BaseInterfaceComponentProps, Y = {}> extends React.Component<
  T,
  Y
> {
  private _componentId: string | null = null

  public get componentId(): string {
    if (!this._componentId) {
      this._componentId = uuid()
    }
    return this._componentId
  }

  static getLayoutDefinition(): LayoutDefinition {
    return {
      name: "__Undefined",
      title: "__Undefined",
    } as LayoutDefinition
  }

  static getDefinitionDefaultValue(
    componentDefinition: ComponentDefinition & { valueKey?: string; defaultValue?: any }
  ): { [key: string]: any } {
    /* Set the default value if provided */
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
    }
    return ((this.constructor as unknown) as typeof BaseInterfaceComponent).getDefinitionDefaultValue(this.props)
  }

  /**
   * Returns data with a value merged at the provided key path
   * @param key
   * @param value
   * @param userInterfaceData
   */
  getMergedData: GetMergedData = (key, value, userInterfaceData) => {
    const pathSegments = key.split(".")
    const isTargetingRoot = pathSegments[0] === "$root"
    if (isTargetingRoot) {
      pathSegments.shift()
    }
    const path = pathSegments.join(".")
    const uiData = isTargetingRoot
      ? this.props.getRootUserInterfaceData()
      : !isUndefined(userInterfaceData)
      ? userInterfaceData
      : this.props.userInterfaceData
    return { mergedData: set(path, value, uiData), isTargetingRoot }
  }

  /**
   * Gets the value from local or root UI data.
   * Provide the "root." keyword at the beginning of the valueKey to use root UI data.
   * @param key
   * @param userInterfaceData -- Optional, provide if using a different source such as from prevProps
   * @param getRootUserInterfaceData -- Optional, provide if using a different source such as from prevProps
   */
  getValue: GetValue = (key, userInterfaceData, getRootUserInterfaceData) => {
    return getValue(
      key,
      userInterfaceData || this.props.userInterfaceData,
      getRootUserInterfaceData || this.props.getRootUserInterfaceData
    )
  }

  /**
   * Sets the value in local or root UI parentRowData.
   * Provide the "$root." keyword at the beginning of the valueKey to use root UI parentRowData.
   * @param key
   * @param value
   * @param userInterfaceData
   */
  setValue: SetValue = (key, value, userInterfaceData) => {
    const { mergedData, isTargetingRoot } = this.getMergedData(key, value, userInterfaceData)
    this.props.onChangeData && this.props.onChangeData(mergedData, isTargetingRoot)
  }

  anyPropsChanged(prevProps: Readonly<BaseInterfaceComponentProps>, propsToCheck: Array<string>): boolean {
    return propsToCheck.some(
      (prop) =>
        this.props[prop] !== prevProps[prop] || (this.props[prop] !== undefined && prevProps[prop] === undefined)
    )
  }

  static availableEvents: string[] = []

  /**
   *
   * @param eventName
   * @param eventPayload
   */
  raiseEvent(eventName: string, eventPayload: EventPayloadType): void {
    console.log(`BaseInterfaceComponent: Component raised event "${eventName}"`, eventPayload)
    if (this.props.onRaiseEvent) {
      this.props.onRaiseEvent(eventName, eventPayload, this)
    }
  }
}
