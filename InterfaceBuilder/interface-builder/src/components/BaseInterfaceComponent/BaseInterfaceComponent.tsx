import React from "react"
import { getValue } from "../../lib/getValue"
import { set } from "lodash/fp"
import { v4 as uuid } from "uuid"
import { ComponentDefinition, ComponentDefinitionNamedProps, LayoutDefinition } from "../../globalTypes"
import { AbstractBaseInterfaceComponent, BaseInterfaceComponentProps, GetValue, SetValue } from "./types"
import { getDefaultsFromComponentDefinitions } from "./componentDefinitionUtils"
import { getMergedData } from "./getMergedData"
import { EventPayloadType } from "../../components/withEvents/types"

/**
 * BaseInterfaceComponent
 *
 * Events:
 * @static availableEvents: string[] - Add event names to raise in the component to this array
 * @method raiseEvent - Raise events by calling this method with an event name and a payload
 */
export abstract class BaseInterfaceComponent<
  P extends BaseInterfaceComponentProps,
  S = Record<string, unknown>
> extends AbstractBaseInterfaceComponent<P, S> {
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
    return getDefaultsFromComponentDefinitions(this.manageForm(), this.getDefinitionDefaultValue)
  }

  // eslint-disable-next-line no-unused-vars
  static getSummary(props: Partial<ComponentDefinitionNamedProps>): JSX.Element | undefined {
    return undefined
  }

  getDefaultValue = (): unknown => {
    if (typeof this.props.defaultValue !== "undefined") {
      return this.props.defaultValue
    }
    return (this.constructor as unknown as typeof BaseInterfaceComponent).getDefinitionDefaultValue(this.props)
  }

  /**
   * Gets the value from local or root UI data.
   * Provide the "$root." keyword at the beginning of the value key to use root UI data.
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
   * Provide the "$root." keyword at the beginning of the value key to use root UI parentRowData.
   * @param kvpTuples
   */
  setValue: SetValue = (kvpTuples) => {
    debugger
    const { isLocalDataDirty, isRootDataDirty, localData, rootData } = getMergedData(
      kvpTuples,
      this.props.userInterfaceData || {},
      this.props.getRootUserInterfaceData
    )
    if (isRootDataDirty) {
      this.props.onChangeRootData(rootData)
    }
    if (isLocalDataDirty) {
      this.props.onChangeData && this.props.onChangeData(localData)
    }
  }

  anyPropsChanged = (prevProps: Readonly<BaseInterfaceComponentProps>, propsToCheck: Array<string>): boolean => {
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
  raiseEvent = (eventName: string, eventPayload: EventPayloadType): void => {
    console.log(`BaseInterfaceComponent: Component raised event "${eventName}"`, eventPayload)
    if (this.props.onRaiseEvent) {
      this.props.onRaiseEvent(eventName, eventPayload, this)
    }
  }
}
