import { JSONRecord } from "../../globalTypes/JSONTypes"
import { BaseInterfaceComponent } from "./BaseInterfaceComponent"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
  UserInterfaceProps,
} from "../../globalTypes"

export interface ChangeObject {
  [key: string]: unknown
}

export type DataBindings = { [K in keyof ComponentDefinitionNamedProps]: JSONRecord }
export type BaseInterfaceComponentProps = ComponentDefinition & ComponentRenderMetaProps
export type BaseInterfaceComponentType = typeof BaseInterfaceComponent

export type GetValue = (
  key: string,
  userInterfaceData?: UserInterfaceProps["data"],
  getRootUserInterfaceData?: () => UserInterfaceProps["data"]
) => string | number | boolean | JSONRecord | JSONRecord[] | null | undefined

export type SetValue = (key: string, value: any, userInterfaceData?: UserInterfaceProps["data"]) => void

export type GetMergedData = (
  key: string,
  value: any,
  userInterfaceData?: UserInterfaceProps["data"]
) => { mergedData: JSONRecord; isTargetingRoot: boolean }

export interface IBaseInterfaceComponent {
  getValue: GetValue
  setValue: SetValue
  getMergedData: GetMergedData
}
