import { ComponentDefinitionNamedProps, ComponentRenderMetaProps } from "../../../base/BaseInterfaceComponent"
import { UserInterfaceProps } from "../../../../UserInterface"
import { PersistedConfig } from "../../../../../../data/GlobalConfig.Config"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import {
  LocalDataHandlerType,
  RemoteDataHandlerType,
} from "./types"


export interface SelectOption {
  label: string
  value: string
  icon?: string
}

export interface ISelectInterfaceComponentProps extends ComponentDefinitionNamedProps {
  allowClear: boolean
  allowCreateNew?: boolean
  component: "select"
  createNewLabel: string
  defaultValue?: string
  disabled?: boolean
  multiple?: boolean
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  valuePrefix?: string
  valueSuffix?: string

  dataHandlerType: LocalDataHandlerType | RemoteDataHandlerType
  data: {}
}

export interface SelectInterfaceComponentPropsLocalData extends ISelectInterfaceComponentProps {
  dataHandlerType: "local"
  data: {
    values: SelectOption[]
  }
}

export interface SelectInterfaceComponentPropsRemoteConfigData extends ISelectInterfaceComponentProps {
  dataHandlerType: "remote-config"
  remoteConfigType?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
}

export interface SelectInterfaceComponentPropsRemoteKeyValueData extends ISelectInterfaceComponentProps {
  dataHandlerType: "remote-kvp"
  remoteKeyValuePair?: PersistedConfig["id"]
  remoteDataFilter: JSONObject
}

export interface SelectInterfaceComponentPropsRemoteQueryData extends ISelectInterfaceComponentProps {
  dataHandlerType: "remote-query"
  remoteQuery?: PersistedConfig["id"]
  remoteDataFilter: JSONObject
  remoteQueryMapping: [{ label: "label"; value: string }, { label: "value"; value: string }]
}

export interface SelectInterfaceComponentPropsRemoteURLData extends ISelectInterfaceComponentProps {
  dataHandlerType: "remote-url"
  remoteURL: string
}

export interface SelectInterfaceComponentState {
  loadError: string | null
  loadStatus: "none" | "loading" | "loaded" | "error"
  options: SelectOption[]
}