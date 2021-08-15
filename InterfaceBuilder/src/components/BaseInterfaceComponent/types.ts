import { JSONRecord } from "../../globalTypes/JSONTypes"
import { BaseInterfaceComponent } from "./BaseInterfaceComponent"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
  UserInterfaceProps,
} from "../../globalTypes"
import { EventPayloadType } from "../../components/withEvents/types"

export type DataBindings = { [K in keyof ComponentDefinitionNamedProps]: JSONRecord }
export type BaseInterfaceComponentProps = ComponentDefinition & ComponentRenderMetaProps
export type BaseInterfaceComponentType = typeof BaseInterfaceComponent

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

export interface IBaseInterfaceComponent {
  getValue: GetValue
  setValue: SetValue
  raiseEvent: RaiseEvent
}
