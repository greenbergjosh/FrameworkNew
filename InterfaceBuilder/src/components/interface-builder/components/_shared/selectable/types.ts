import {
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
} from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { TSEnum } from "components/interface-builder/@types/ts-enum"
import { SelectProps as AntdSelectProps } from "antd/lib/select"

/* *********************************************
 *
 * Misc Types & Interfaces
 */

export interface KeyValuePair {
  key: string
  value: string
}

export interface KeyValuePairConfig {
  items: KeyValuePair[]
}

export type LocalDataHandlerType = "local" | "local-function"
export type LoadStatusType = "none" | "loading" | "loaded" | "error"

export const MODES: TSEnum<AntdSelectProps["mode"]> = {
  default: "default",
  multiple: "multiple",
  tags: "tags",
}

/* *********************************************
 *
 * Selectable Interfaces
 */

export interface SelectableOption {
  label: string
  value: string
  icon?: string
}

export interface ISelectableProps extends ComponentDefinitionNamedProps {
  allowCreateNew?: boolean
  createNewLabel: string
  defaultValue?: string
  disabled?: boolean
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  valueKey: string
  valuePrefix?: string
  valueSuffix?: string

  dataHandlerType: LocalDataHandlerType
  data: {}
  children: (props: SelectableChildProps) => JSX.Element | JSX.Element[] | null
}

export interface SelectablePropsLocalData extends ISelectableProps {
  dataHandlerType: "local"
  data: {
    values: SelectableOption[]
  }
}

export interface SelectableState {
  loadError: string | null
  loadStatus: LoadStatusType
  options: SelectableOption[]
}

export type SelectableProps = SelectablePropsLocalData & ComponentRenderMetaProps

/* *********************************************
 *
 * SelectableChild Interfaces
 */

export interface SelectableChildProps {
  allowCreateNew?: boolean
  createNewLabel: string
  disabled?: boolean

  getCleanValue: () => string | string[] | undefined
  loadError: string | null
  loadStatus: LoadStatusType
  options: SelectableOption[]
}
