import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { QueryConfig } from "../../data/Report"
import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"
import { QueryProps } from "../_shared/query/types"

export interface IQueryInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "query"
  components: ComponentDefinition[]
  loadingKey?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  queryType: QueryProps["queryType"]
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  valueKey: string
}

interface QueryInterfaceComponentDisplayModeProps extends IQueryInterfaceComponentProps {
  mode: "display"
}

interface QueryInterfaceComponentEditModeProps extends IQueryInterfaceComponentProps {
  mode: "edit"
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}

interface QueryRemoteQueryInterfaceComponentProps extends IQueryInterfaceComponentProps {
  queryType: "remote-query"
  remoteQuery?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
  // remoteQueryMapping?: [{ label: "label"; value: string }, { label: "value"; value: string }]
}

interface QueryRemoteUrlInterfaceComponentProps extends IQueryInterfaceComponentProps {
  queryType: "remote-url"
  remoteUrl?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
}

interface QueryRemoteConfigInterfaceComponentProps extends IQueryInterfaceComponentProps {
  queryType: "remote-config"
  remoteConfigType?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
}

export type QueryInterfaceComponentProps = (
  | QueryRemoteQueryInterfaceComponentProps
  | QueryRemoteUrlInterfaceComponentProps
  | QueryRemoteConfigInterfaceComponentProps
) &
  (QueryInterfaceComponentDisplayModeProps | QueryInterfaceComponentEditModeProps)

export interface QueryInterfaceComponentState {
  data: any[]
  loadError: string | null
  loadStatus: "none" | "loading" | "loaded" | "error"
  parameterValues: { [key: string]: any }
  promptLayout: QueryConfig["layout"]
  promptParameters: QueryConfig["parameters"]
}
