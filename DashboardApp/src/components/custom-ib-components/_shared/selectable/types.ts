import {
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
  TSEnum,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { SelectProps as AntdSelectProps } from "antd/lib/select"
import { PersistedConfig } from "../../../../data/GlobalConfig.Config"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"

/* *********************************************
 *
 * Misc Types & Interfaces
 */

export type RemoteFunctionType = (
  userInterfaceData: any | undefined,
  rootUserInterfaceData: any | undefined
) => SelectableOption[]

export interface KeyValuePair {
  key: string
  value: string
}

export interface KeyValuePairConfig {
  items: KeyValuePair[]
}

export type LocalDataHandlerType = "local"
export type RemoteDataHandlerType = "remote-config" | "remote-kvp" | "remote-query" | "remote-url" | "remote-function"
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
  valueKey: string
  valuePrefix?: string
  valueSuffix?: string

  dataHandlerType: LocalDataHandlerType | RemoteDataHandlerType
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: {}
  remoteFunctionType?: string
  children: (props: SelectableChildProps) => JSX.Element | JSX.Element[] | null
}

export interface SelectablePropsLocalData extends ISelectableProps {
  dataHandlerType: "local"
  data: {
    values: SelectableOption[]
  }
}

export interface SelectablePropsRemoteFunctionData extends ISelectableProps {
  dataHandlerType: "remote-function"
  remoteFunctionType?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
}

export interface SelectablePropsRemoteConfigData extends ISelectableProps {
  dataHandlerType: "remote-config"
  remoteConfigType?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
}

export interface SelectablePropsRemoteKeyValueData extends ISelectableProps {
  dataHandlerType: "remote-kvp"
  remoteKeyValuePair?: PersistedConfig["id"]
  remoteDataFilter: JSONObject
}

export interface SelectablePropsRemoteQueryData extends ISelectableProps {
  dataHandlerType: "remote-query"
  remoteQuery?: PersistedConfig["id"]
  remoteDataFilter: JSONObject
  remoteQueryMapping: [{ label: "label"; value: string }, { label: "value"; value: string }]
}

export interface SelectablePropsRemoteURLData extends ISelectableProps {
  dataHandlerType: "remote-url"
  remoteURL: string
}

export interface SelectableState {
  loadError: string | null
  loadStatus: LoadStatusType
  options: SelectableOption[]
  remoteFunction?: RemoteFunctionType
}

export type SelectableProps = (
  | SelectablePropsLocalData
  | SelectablePropsRemoteFunctionData
  | SelectablePropsRemoteConfigData
  | SelectablePropsRemoteKeyValueData
  | SelectablePropsRemoteQueryData
  | SelectablePropsRemoteURLData
) &
  ComponentRenderMetaProps

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
  handleFocus: () => void
}