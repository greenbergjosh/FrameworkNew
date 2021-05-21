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
  userInterfaceData: UserInterfaceProps["data"],
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"],
  setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"]
) => SelectableOption[]

export interface KeyValuePair {
  key: string
  value: string
}

export interface KeyValuePairConfig {
  items: KeyValuePair[]
}

export type LocalDataHandlerType = "local"
export type RemoteDataHandlerType =
  | "ui-data-key"
  | "remote-config"
  | "remote-kvp"
  | "remote-query"
  | "remote-url"
  | "remote-function"
export type LoadStatusType = "none" | "loading" | "loaded" | "error"
export type ModeType = TSEnum<AntdSelectProps["mode"]>

export const MODES: ModeType = {
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
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"]
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

export interface SelectablePropsUiDataKey extends ISelectableProps {
  dataHandlerType: "ui-data-key"
  optionsKey?: string
  optionLabelKey?: string
  optionValueKey?: string
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
  | SelectablePropsUiDataKey
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
