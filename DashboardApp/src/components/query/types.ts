import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { ParameterItem, QueryConfig } from "../../data/Report"
import { JSONRecord } from "../../data/JSON"
import { AppDispatch } from "../../state/store.types"
import { ButtonProps } from "../custom-ib-components/execute/types"
import { AdminUserInterfaceContextManager } from "../../data/AdminUserInterfaceContextManager.type"
import { UserInterfaceContextManager, UserInterfaceProps } from "@opg/interface-builder"

/* ****************************************************
 *
 * Query Form
 */

export interface QueryFormProps {
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  layout: QueryConfig["layout"]
  parameters: QueryConfig["parameters"]
  parameterValues: JSONRecord
  onMount?: (parameterValues: JSONRecord) => void | Promise<unknown>
  onSubmit: (parameterValues: JSONRecord) => void | Promise<unknown>
  parentSubmitting?: boolean
  setParentSubmitting?: (submitting: boolean) => void
  submitButtonProps?: ButtonProps
  submitButtonLabel?: string // retained for legacy
}

export type SortedParamsType = {
  unsatisfiedByParentParams: ParameterItem[]
  satisfiedByParentParams: JSONRecord
}

export type PrivilegedUserInterfaceContextManager = Partial<AdminUserInterfaceContextManager> &
  UserInterfaceContextManager<PersistedConfig>

/* ****************************************************
 *
 * Submit Button
 */

export type confirmationType = {
  title?: string
  message?: string
  okText?: string
  cancelText?: string
}

export interface SubmitButtonProps {
  onSubmit: () => void
  loading?: boolean
  submitButtonLabel?: string
  submitButtonProps?: ButtonProps
}

/* ****************************************************
 *
 * Query
 */

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
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  inputData?: JSONObject
  paused?: boolean
  queryType: "remote-query" | "remote-config" | "remote-url"
  refresh?: QueryRefreshOptions
}

interface QueryRemoteQueryProps<T> extends IQueryProps<T> {
  queryType: "remote-query"
  remoteQuery?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
  // remoteQueryMapping?: [{ label: "label"; value: string }, { label: "value"; value: string }]
}

interface QueryRemoteUrlProps<T> extends IQueryProps<T> {
  queryType: "remote-url"
  remoteUrl?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
}

interface QueryRemoteConfigProps<T> extends IQueryProps<T> {
  queryType: "remote-config"
  remoteConfigType?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
}

export type QueryProps<T = any> = QueryRemoteQueryProps<T> | QueryRemoteUrlProps<T> | QueryRemoteConfigProps<T>

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
