import { JSONRecord } from "../../globalTypes/JSONTypes"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
  LayoutDefinition,
  UserInterfaceProps,
} from "../../globalTypes"
import { EventPayloadType } from "../../components/withEvents/types"
import React from "react"

export type DataBindings = { [K in keyof ComponentDefinitionNamedProps]: JSONRecord }
export type BaseInterfaceComponentProps = ComponentDefinition & ComponentRenderMetaProps

export type GetValue = (
  key: string,
  userInterfaceData?: UserInterfaceProps["data"],
  getRootUserInterfaceData?: UserInterfaceProps["getRootUserInterfaceData"]
) => UserInterfaceProps["data"]

/**
 * KVPTuple
 * @param key: string
 * @param value: UserInterfaceProps["data"]
 * @param localContext: (optional) UserInterfaceProps["data"] | undefined
 */
export type KVPTuple =
  | [string, UserInterfaceProps["data"]]
  | [string, UserInterfaceProps["data"], UserInterfaceProps["data"]]

export type SetValue = (kvpTuples: KVPTuple | KVPTuple[]) => void

export type RaiseEvent = (eventName: string, eventPayload: EventPayloadType, source?: any) => void

export type TargetType = "$root" | "$root.key" | "$" | "$.key"

export type AbstractBaseInterfaceComponentType = typeof AbstractBaseInterfaceComponent

export abstract class AbstractBaseInterfaceComponent<
  P extends BaseInterfaceComponentProps,
  S = Record<string, unknown>
> extends React.Component<P, S> {
  static getLayoutDefinition: () => LayoutDefinition
  static getDefinitionDefaultValue: (
    componentDefinition: ComponentDefinition & { valueKey?: string; defaultValue?: any }
  ) => {
    [key: string]: any
  }
  static manageForm: (...args: ComponentDefinition[]) => ComponentDefinition[]
  static getManageFormDefaults: () => { [key: string]: any }
  static getSummary: (props: Partial<ComponentDefinitionNamedProps>) => JSX.Element | undefined
  static availableEvents: string[]

  public abstract componentId: string
  public abstract getDefaultValue: () => unknown
  public abstract getValue: GetValue
  public abstract setValue: SetValue
  public abstract anyPropsChanged: (prevProps: Readonly<BaseInterfaceComponentProps>, propsToCheck: Array<string>) => boolean
  public abstract raiseEvent: RaiseEvent
}
