import { ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"
import { PersistedConfig } from "../../../../data/GlobalConfig.Config"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { LoadStatusType, LocalDataHandlerType, RemoteDataHandlerType } from "./Selectable.types"
import { SelectableChildProps } from "./SelectableChild.interfaces"

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
  data: {}
  children: (props: SelectableChildProps) => JSX.Element | JSX.Element[] | null
}

export interface SelectablePropsLocalData extends ISelectableProps {
  dataHandlerType: "local"
  data: {
    values: SelectableOption[]
  }
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
}
