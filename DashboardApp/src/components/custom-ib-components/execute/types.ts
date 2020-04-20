import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { QueryConfig } from "../../../data/Report"
import { JSONRecord } from "../../../data/JSON"
import { AppDispatch } from "../../../state/store.types"

export interface IExecuteInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "query"
  components: ComponentDefinition[]
  loadingKey?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  queryType: "remote-query" | "remote-config" | "remote-url"
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
  fromStore?: any
  dispatch?: AppDispatch
  buttonLabel?: string
}

interface ExecuteInterfaceComponentDisplayModeProps extends IExecuteInterfaceComponentProps {
  mode: "display"
}

interface ExecuteInterfaceComponentEditModeProps extends IExecuteInterfaceComponentProps {
  mode: "edit"
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}

interface ExecuteRemoteQueryInterfaceComponentProps extends IExecuteInterfaceComponentProps {
  queryType: "remote-query"
  remoteQuery?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
}

interface ExecuteRemoteConfigInterfaceComponentProps extends IExecuteInterfaceComponentProps {
  queryType: "remote-config"
  remoteConfigType?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
}

interface ExecuteRemoteUrlInterfaceComponentProps extends IExecuteInterfaceComponentProps {
  queryType: "remote-url"
  remoteUrl?: PersistedConfig["id"] //<-- possibly should be remoteConfigType?
  remoteDataFilter?: JSONObject
}

export type ExecuteInterfaceComponentProps = (
  | ExecuteRemoteQueryInterfaceComponentProps
  | ExecuteRemoteConfigInterfaceComponentProps
  | ExecuteRemoteUrlInterfaceComponentProps
) &
  (ExecuteInterfaceComponentDisplayModeProps | ExecuteInterfaceComponentEditModeProps)

export interface ExecuteInterfaceComponentState {
  data: any[]
  loadError: string | null
  loadStatus: "none" | "loading" | "loaded" | "error"
  parameterValues: JSONRecord
  promptLayout: QueryConfig["layout"]
  promptParameters: QueryConfig["parameters"]
  formState: any
  /**
   * QueryConfig is type of taggedUnion:
   * ( HTTPRequestQueryConfigCodec | SQLQueryConfigCodec | StoredProcQueryConfigCodec )
   * from Reports.ts
   */
  queryConfig: QueryConfig | null
}
