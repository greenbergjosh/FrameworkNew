import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { PersistedConfig } from "../../../api/GlobalConfigCodecs"
import { ParameterItem, QueryConfig } from "../../../api/ReportCodecs"
import { JSONRecord } from "../../../lib/JSONRecord"
import { AppDispatch } from "../../../state/store.types"
import { AdminUserInterfaceContextManager } from "../../../contexts/AdminUserInterfaceContextManager.type"
import { UserInterfaceContextManager, UserInterfaceProps } from "@opg/interface-builder"
import { AbstractBaseInterfaceComponentType } from "@opg/interface-builder/src/components/BaseInterfaceComponent/types"
import { Option } from "fp-ts/lib/Option"
import React from "react"
import { NotifyConfig } from "../../../state/feedback"

/* ****************************************************
 *
 * Query Params
 */

export interface PropsFromQueryParams {
  parameterValues: Option<JSONRecord>
  satisfiedByParentParams: JSONRecord
  setParameterValues: (value: React.SetStateAction<Option<JSONRecord>>) => void
  unsatisfiedByParentParams: ParameterItem[]
}

export type OnSubmitType = (
  parameterValues: JSONRecord,
  satisfiedByParentParams: PropsFromQueryParams["satisfiedByParentParams"],
  setParameterValues: PropsFromQueryParams["setParameterValues"]
) => Promise<void | NotifyConfig> | undefined

export type OnMountType = (
  handleSubmit: () => Promise<void | NotifyConfig> | undefined
) => Promise<void | NotifyConfig> | undefined

export interface QueryParamsProps {
  parentData?: JSONRecord
  queryConfig: QueryConfig

  // From QueryForm
  getDefinitionDefaultValue: AbstractBaseInterfaceComponentType["getDefinitionDefaultValue"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  layout: QueryConfig["layout"]
  onMount?: OnSubmitType
  onSubmit: OnSubmitType
  parentSubmitting?: boolean
  setParentSubmitting?: (submitting: boolean) => void
}

/* ****************************************************
 *
 * Query Form
 */

export interface QueryFormProps {
  getDefinitionDefaultValue: AbstractBaseInterfaceComponentType["getDefinitionDefaultValue"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  layout: QueryConfig["layout"]
  parameters: QueryConfig["parameters"]
  parameterValues: JSONRecord
  onMount?: (parameterValues: JSONRecord) => void | Promise<unknown>
  onSubmit: (parameterValues: JSONRecord) => void | Promise<unknown>
  parentSubmitting?: boolean
  setParentSubmitting?: (submitting: boolean) => void
}

export type SortedParamsType = {
  unsatisfiedByParentParams: ParameterItem[]
  satisfiedByParentParams: JSONRecord
}

export type PrivilegedUserInterfaceContextManager = Partial<AdminUserInterfaceContextManager> &
  UserInterfaceContextManager<PersistedConfig>

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
  getDefinitionDefaultValue: AbstractBaseInterfaceComponentType["getDefinitionDefaultValue"]
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
}
