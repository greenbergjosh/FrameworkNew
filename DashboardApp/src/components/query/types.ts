import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { QueryConfig } from "../../data/Report"
import { JSONRecord } from "../../data/JSON"
import { AppDispatch } from "../../state/store.types"

export interface QueryChildProps<T = any> {
  data: T[]
  loading?: boolean
}

export interface QueryRefreshOptions {
  interval?: number
  stopOnFailure?: boolean
}

export interface LoadDataParams {
  dispatchExecuteQuery: AppDispatch["reports"]["executeQuery"]
  queryResultURI: string
  queryConfig: QueryConfig
  satisfiedParams: JSONRecord
}

export interface IQueryProps<T> {
  children: (childProps: QueryChildProps<T>) => JSX.Element | JSX.Element[] | null
  dataKey?: string
  inputData?: JSONObject
  paused?: boolean
  queryType: "remote-query" | "remote-config"
  refresh?: QueryRefreshOptions
}

interface QueryRemoteQueryProps<T> extends IQueryProps<T> {
  queryType: "remote-query"
  remoteQuery?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
  // remoteQueryMapping?: [{ label: "label"; value: string }, { label: "value"; value: string }]
}

interface QueryRemoteConfigProps<T> extends IQueryProps<T> {
  queryType: "remote-config"
  remoteConfigType?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
}

export type QueryProps<T = any> = QueryRemoteQueryProps<T> | QueryRemoteConfigProps<T>

export interface QueryState<T> {
  runCount: number
  data: T[]
  loadError: string | null
  loadStatus: "none" | "loading" | "loaded" | "error"
  parameterValues: { [key: string]: any }
  promptLayout: QueryConfig["layout"]
  promptParameters: QueryConfig["parameters"]
  renderedChildren?: ReturnType<IQueryProps<T>["children"]>
  refreshTimeout?: ReturnType<typeof setTimeout> | null
  remoteQueryLoggingName?: string | null
  submitButtonLabel?: string
}