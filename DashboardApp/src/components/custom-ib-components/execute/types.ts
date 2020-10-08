import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  UserInterfaceContextManager,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { ConfigType, PersistedConfig } from "../../../data/GlobalConfig.Config"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { QueryConfig } from "../../../data/Report"
import { AppDispatch, AppState } from "../../../state/store.types"
import { confirmationType, QueryFormProps } from "../../query/types"
import { JSONRecord } from "../../../data/JSON"
import { PropsFromQueryParams } from "../../query/QueryParams"
import { Branded } from "io-ts"
import { NonEmptyStringBrand } from "io-ts-types/lib/NonEmptyString"

export type ShapeType = "circle" | "circle-outline" | "round" | undefined
export type SizeType = "small" | "large" | undefined
export type ButtonDisplayType = "primary" | "ghost" | "dashed" | "danger" | "link" | undefined
export type LoadStatusCode = "none" | "loading" | "loaded" | "error"
export type LoadError = string | null
export type QueryType = "remote-query" | "remote-query-update" | "remote-config" | "remote-url"
export type ActionType = "read" | "create" | "update" | "delete"
export type ResultsType = "all" | "selected" | "static"

export type ButtonProps = {
  block: boolean
  buttonLabel: string
  component: "button"
  confirmation?: confirmationType
  defaultValue?: string
  displayType: ButtonDisplayType
  ghost: boolean
  hideButtonLabel: boolean
  icon: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  requireConfirmation: boolean
  shape: ShapeType
  size: SizeType
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
}

interface ExecuteButtonProps {
  buttonProps: ButtonProps
}

export interface IExecuteInterfaceComponentProps extends ComponentDefinitionNamedProps {
  autoExecuteIntervalSeconds?: number
  buttonLabel?: string
  component: "query"
  components: ComponentDefinition[]
  executeImmediately?: boolean
  inboundApiKey: string
  loadingKey?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  outboundValueKey: string
  queryType: QueryType
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

export type LoadStatus = {
  data: JSONRecord | JSONRecord[] | null
  loadStatus: LoadStatusCode
  loadError?: LoadError
}

export interface ExecuteInterfaceComponentState {
  data: JSONRecord | JSONRecord[] | null
  loadError: LoadError
  loadStatus: LoadStatusCode
  formState: any
  /**
   * QueryConfig is type of taggedUnion:
   * ( HTTPRequestQueryConfigCodec | SQLQueryConfigCodec | StoredProcQueryConfigCodec | RemoteConfigQueryConfigCodec )
   * from Reports.ts
   */
  queryConfig?: QueryConfig
  submittingQueryForm: boolean
}

export interface ExecuteInterfaceComponentDisplayModeProps extends IExecuteInterfaceComponentProps {
  mode: "display"
}

export interface ExecuteInterfaceComponentEditModeProps extends IExecuteInterfaceComponentProps {
  mode: "edit"
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}

export interface ExecuteRemoteQueryInterfaceComponentProps extends IExecuteInterfaceComponentProps {
  queryType: "remote-query"
  remoteDataFilter?: JSONObject // TODO: What is this for?

  // RemoteQuery Settings
  remoteQuery?: PersistedConfig["id"]
  RemoteQuery_isCRUD?: boolean
}

export interface ExecuteRemoteConfigInterfaceComponentProps extends IExecuteInterfaceComponentProps {
  queryType: "remote-config"
  remoteDataFilter?: JSONObject // TODO: What is this for?
  remoteConfigType?: PersistedConfig["id"] // TODO: This may be a duplicate of RemoteConfig_id?

  // RemoteConfig Settings
  RemoteConfig_actionType: ActionType
  RemoteConfig_configNameKey?: string
  RemoteConfig_entityTypeId?: PersistedConfig["id"]
  RemoteConfig_id?: PersistedConfig["id"]
  RemoteConfig_idKey?: string
  RemoteConfig_resultsType?: ResultsType
}

export interface ExecuteRemoteUrlInterfaceComponentProps extends IExecuteInterfaceComponentProps {
  queryType: "remote-url"
  remoteDataFilter?: JSONObject // TODO: What is this for?

  // RemoteUrl Settings
  remoteUrl?: PersistedConfig["id"]
  RemoteUrl_isCRUD?: boolean
}

export type ExecuteInterfaceComponentProps = (
  | ExecuteRemoteQueryInterfaceComponentProps
  | ExecuteRemoteConfigInterfaceComponentProps
  | ExecuteRemoteUrlInterfaceComponentProps
) &
  (ExecuteInterfaceComponentDisplayModeProps | ExecuteInterfaceComponentEditModeProps) &
  ExecuteButtonProps

/* ****************************************************************************
 *
 * COMPONENTS
 */

export type OnSubmitType = (
  parameterValues: JSONRecord,
  satisfiedByParentParams: PropsFromQueryParams["satisfiedByParentParams"],
  setParameterValues: PropsFromQueryParams["setParameterValues"]
) => Promise<void> | undefined

export type OnMountType = (handleSubmit: () => Promise<void> | undefined) => Promise<void> | undefined

export interface RemoteComponentProps {
  buttonLabel: IExecuteInterfaceComponentProps["buttonLabel"]
  buttonProps: ButtonProps
  context: UserInterfaceContextManager | null
  onChangeData: IExecuteInterfaceComponentProps["onChangeData"]
  onMount: OnMountType
  outboundValueKey: IExecuteInterfaceComponentProps["outboundValueKey"]
  parentSubmitting: QueryFormProps["parentSubmitting"]
  persistedConfigId: PersistedConfig["id"]
  setParentSubmitting: QueryFormProps["setParentSubmitting"]
  userInterfaceData: IExecuteInterfaceComponentProps["userInterfaceData"]
  valueKey: IExecuteInterfaceComponentProps["valueKey"]
}

export interface RemoteQueryProps extends RemoteComponentProps {
  isCRUD?: boolean
}

export interface RemoteUrlProps extends RemoteComponentProps {
  isCRUD?: boolean
}

export interface RemoteConfigProps extends RemoteComponentProps {
  actionType: ActionType
  configNameKey?: string // The name value key for the config to edit
  entityTypeId?: PersistedConfig["id"] // The type ID of the config to edit
  remoteConfigId?: PersistedConfig["id"] // The config ID to edit
  remoteConfigIdKey?: string // The key for the config ID to edit
  resultsType?: ResultsType
}

/* ****************************************************************************
 *
 * COMPONENTS: REMOTE CONFIG
 */

export interface FromStore {
  configNames: Branded<string, NonEmptyStringBrand>[] //store.select.globalConfig.configNames(appState),
  configs: AppState["globalConfig"]["configs"] //appState.globalConfig.configs,
  configsById: Record<PersistedConfig["id"], PersistedConfig> //store.select.globalConfig.configsById(appState),
  configsByType: Record<ConfigType, Array<PersistedConfig>> //store.select.globalConfig.configsByType(appState),
  defaultEntityTypeConfig: AppState["globalConfig"]["defaultEntityTypeConfig"] //appState.globalConfig.defaultEntityTypeConfig,
  entityTypes: Record<ConfigType, PersistedConfig> //store.select.globalConfig.entityTypeConfigs(appState),
  isDeletingRemoteConfig: boolean //appState.loading.effects.globalConfig.deleteRemoteConfigs,
  isUpdatingRemoteConfig: boolean //appState.loading.effects.globalConfig.updateRemoteConfig,
  reportDataByQuery: AppState["reports"]["reportDataByQuery"] //appState.reports.reportDataByQuery,
  loadById: (id: string) => PersistedConfig | null
  loadByType: (type: string) => PersistedConfig[] | null
}

export type ExecuteRemoteConfigParams = {
  actionType: ActionType
  configNameKey?: string // The name value key for the config to edit
  dispatch: AppDispatch
  entityTypeId?: PersistedConfig["id"] // The type ID of the config to edit
  fromStore: FromStore
  parameterValues: JSONRecord
  queryConfig: QueryConfig
  queryFormValues: JSONRecord
  remoteConfigId?: PersistedConfig["id"] // The config ID to edit
  remoteConfigIdKey?: string // The key for the config ID to edit
  resultsType?: ResultsType
  uiDataSlice: UserInterfaceProps["data"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
}

export type RemoteConfigActionParams = {
  configNameKey?: string // The name value key for the config to edit
  dispatch: AppDispatch
  entityTypeId?: PersistedConfig["id"] // The type ID of the config to edit
  fromStore: FromStore
  parameterValues: JSONRecord
  queryConfig: QueryConfig
  queryFormValues: JSONRecord
  remoteConfigId?: PersistedConfig["id"] // The config ID to edit
  remoteConfigIdKey?: string // The key for the config ID to edit
  resultsType?: ResultsType
  uiDataSlice: UserInterfaceProps["data"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
}
