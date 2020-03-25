import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { QueryProps, IQueryProps } from "../../query/types"
import { QueryConfig } from "../../../data/Report"
import { JSONRecord } from "../../../data/JSON"
import { AppDispatch } from "../../../state/store.types"

export interface IExecuteInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "query"
  components: ComponentDefinition[]
  loadingKey?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  queryType: QueryProps["queryType"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
  fromStore?: any
  dispatch?: AppDispatch
}

export

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
  // remoteQueryMapping?: [{ label: "label"; value: string }, { label: "value"; value: string }]
}

interface ExecuteRemoteConfigInterfaceComponentProps extends IExecuteInterfaceComponentProps {
  queryType: "remote-config"
  remoteConfigType?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
}

export type ExecuteInterfaceComponentProps = (
  | ExecuteRemoteQueryInterfaceComponentProps
  | ExecuteRemoteConfigInterfaceComponentProps
  ) &
  (ExecuteInterfaceComponentDisplayModeProps | ExecuteInterfaceComponentEditModeProps)

export interface ExecuteInterfaceComponentState {
  data: any[]
  loadError: string | null
  loadStatus: "none" | "loading" | "loaded" | "error"
  parameterValues: JSONRecord //{ [key: string]: any }
  promptLayout: QueryConfig["layout"]
  promptParameters: QueryConfig["parameters"]
  formState: any
  queryConfig: any
  submitButtonLabel?: string
}