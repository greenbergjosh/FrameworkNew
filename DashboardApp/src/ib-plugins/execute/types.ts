import {
  AbstractBaseInterfaceComponentType,
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  GetValue,
  UserInterfaceContextManager,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { ConfigType, PersistedConfig } from "../../data/GlobalConfig.Config"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { QueryConfig } from "../../data/Report"
import { AppDispatch, AppState } from "../../state/store.types"
import { confirmationType, QueryFormProps } from "../../components/query/types"
import { JSONRecord } from "../../data/JSON"
import { PropsFromQueryParams } from "../../components/query/QueryParams"
import { Branded } from "io-ts"
import { NonEmptyStringBrand } from "io-ts-types/lib/NonEmptyString"
import { NotifyConfig } from "../../state/feedback"
import { AbstractBaseInterfaceComponent } from "@opg/interface-builder/dist/components/BaseInterfaceComponent/types"

export enum LOADSTATUSCODES {
  none = "none",
  loading = "loading",
  loaded = "loaded",
  created = "created",
  updated = "updated",
  deleted = "deleted",
  error = "error",
}

export type ShapeType = "circle" | "circle-outline" | "round" | undefined
export type SizeType = "small" | "large" | undefined
export type ButtonDisplayType = "primary" | "ghost" | "dashed" | "danger" | "link" | undefined
export type LoadStatusCode =
  | LOADSTATUSCODES.none
  | LOADSTATUSCODES.loading
  | LOADSTATUSCODES.loaded
  | LOADSTATUSCODES.created
  | LOADSTATUSCODES.updated
  | LOADSTATUSCODES.deleted
  | LOADSTATUSCODES.error
export type LoadError = string | null
export type QueryType = "remote-query" | "remote-query-update" | "remote-config" | "remote-url"
export type ActionType = "read" | "create" | "update" | "delete"
export type ResultsType = "all" | "selected" | "static"
export type ParamKVPMapsType = { values: { fieldName: string; valueKey: string }[] }

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
  outboundLoadingKey?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  outboundValueKey: string
  paramKVPMaps: ParamKVPMapsType
  queryType: QueryType
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  valueKey: string
}

export interface ErrorResponse {
  data: JSONRecord | JSONRecord[] | null
  error: string
  status: "error"
}

export type LoadStatus = {
  data: JSONRecord | JSONRecord[] | null
  loadStatus: LoadStatusCode
  loadError?: LoadError
  remoteQueryLoggingName?: string
}

export interface ExecuteInterfaceComponentState extends LoadStatus {
  formState: any
  /**
   * QueryConfig is type of taggedUnion:
   * ( HTTPRequestQueryConfigCodec | SQLQueryConfigCodec | StoredProcQueryConfigCodec | RemoteConfigQueryConfigCodec )
   * from Reports.ts
   */
  queryConfig?: QueryConfig
  submitting: boolean
  transientParams: JSONRecord // Params passed from an LBM that are retained only during a single submit cycle.
  onExecute?: () => void
  onComplete?: () => void
}

export interface ExecuteInterfaceComponentDisplayModeProps extends IExecuteInterfaceComponentProps {
  mode: "display"
  submitEventSource: any
}

export interface ExecuteInterfaceComponentPreviewModeProps extends IExecuteInterfaceComponentProps {
  mode: "preview"
  submitEventSource: any
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
  RemoteQuery_notifyOkShow?: boolean
  RemoteQuery_notifyUnauthorizedShow?: boolean
  RemoteQuery_notifyServerExceptionShow?: boolean
}

export interface ExecuteRemoteConfigInterfaceComponentProps extends IExecuteInterfaceComponentProps {
  queryType: "remote-config"
  remoteDataFilter?: JSONObject // TODO: What is this for?

  // RemoteConfig Settings
  RemoteConfig_actionType: ActionType
  RemoteConfig_redirectPath?: string
  RemoteConfig_entityTypeId?: PersistedConfig["id"]
  RemoteConfig_staticId?: PersistedConfig["id"]
  RemoteConfig_resultsType?: ResultsType
  RemoteConfig_useRedirect?: boolean
}

export interface ExecuteRemoteUrlInterfaceComponentProps extends IExecuteInterfaceComponentProps {
  queryType: "remote-url"
  remoteDataFilter?: JSONObject // TODO: What is this for?

  // RemoteUrl Settings
  remoteUrl?: PersistedConfig["id"]
  RemoteUrl_isCRUD?: boolean
  RemoteUrl_notifyOkShow?: boolean
  RemoteUrl_notifyUnauthorizedShow?: boolean
  RemoteUrl_notifyServerExceptionShow?: boolean
}

export type ExecuteInterfaceComponentProps = (
  | ExecuteRemoteQueryInterfaceComponentProps
  | ExecuteRemoteConfigInterfaceComponentProps
  | ExecuteRemoteUrlInterfaceComponentProps
) &
  (
    | ExecuteInterfaceComponentDisplayModeProps
    | ExecuteInterfaceComponentPreviewModeProps
    | ExecuteInterfaceComponentEditModeProps
  ) &
  ExecuteButtonProps

/* ****************************************************************************
 *
 * COMPONENTS
 */

export type OnSubmitType = (
  parameterValues: JSONRecord,
  satisfiedByParentParams: PropsFromQueryParams["satisfiedByParentParams"],
  setParameterValues: PropsFromQueryParams["setParameterValues"]
) => Promise<void | NotifyConfig> | undefined

export type OnMountType = (
  handleSubmit: () => Promise<void | NotifyConfig> | undefined
) => Promise<void | NotifyConfig> | undefined

export interface RemoteComponentProps {
  buttonLabel: IExecuteInterfaceComponentProps["buttonLabel"]
  buttonProps: ButtonProps
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  mode: "display" | "preview" | "edit"
  onChangeData: IExecuteInterfaceComponentProps["onChangeData"]
  onRaiseEvent: BaseInterfaceComponent<ExecuteInterfaceComponentProps, ExecuteInterfaceComponentState>["raiseEvent"]
  onMount: OnMountType
  outboundValueKey: IExecuteInterfaceComponentProps["outboundValueKey"]
  parentSubmitting: QueryFormProps["parentSubmitting"]
  setParentSubmitting: QueryFormProps["setParentSubmitting"]
  userInterfaceData: UserInterfaceProps["data"]
  getParams: () => JSONRecord
  onExecute?: () => void
  onComplete?: () => void
  getDefinitionDefaultValue: AbstractBaseInterfaceComponentType["getDefinitionDefaultValue"]
}

export interface FromStore {
  reportDataByQuery: AppState["reports"]["reportDataByQuery"]
  loadById: UserInterfaceContextManager["loadById"]
}

/* ****************************************************************************
 *
 * COMPONENTS: REMOTE QUERY
 */

export interface RemoteQueryFromStore extends FromStore {
  executeQuery: AppDispatch["reports"]["executeQuery"]
  executeQueryUpdate: AppDispatch["reports"]["executeQueryUpdate"]
}

export interface RemoteQueryProps extends RemoteComponentProps, RemoteQueryFromStore {
  isCRUD?: boolean
  notifyOkShow?: boolean
  notifyUnauthorizedShow?: boolean
  notifyServerExceptionShow?: boolean
  onResults: IExecuteInterfaceComponentProps["onChangeData"]
  queryConfigId: PersistedConfig["id"]
}

/* ****************************************************************************
 *
 * COMPONENTS: REMOTE URL
 */

export interface RemoteUrlFromStore extends FromStore {
  executeHTTPRequestQuery: AppDispatch["reports"]["executeHTTPRequestQuery"]
}

export interface RemoteUrlProps extends RemoteComponentProps, RemoteUrlFromStore {
  isCRUD?: boolean
  notifyOkShow?: boolean
  notifyUnauthorizedShow?: boolean
  notifyServerExceptionShow?: boolean
  onResults: IExecuteInterfaceComponentProps["onChangeData"]
  queryConfigId: PersistedConfig["id"]
}

/* ****************************************************************************
 *
 * COMPONENTS: REMOTE CONFIG
 */

export interface RemoteConfigProps extends RemoteComponentProps {
  actionType: ActionType
  redirectPath?: string
  entityTypeId?: PersistedConfig["id"] // The type ID of the config to edit
  onResults: IExecuteInterfaceComponentProps["onChangeData"]
  remoteConfigStaticId?: PersistedConfig["id"] // A fixed config ID to fetch
  resultsType?: ResultsType
  useRedirect?: boolean
  getValue: GetValue
}

export interface RemoteConfigFromStore extends FromStore {
  configNames: Branded<string, NonEmptyStringBrand>[] //store.select.globalConfig.configNames(appState),
  configs: AppState["globalConfig"]["configs"] //appState.globalConfig.configs,
  configsById: Record<PersistedConfig["id"], PersistedConfig> //store.select.globalConfig.configsById(appState),
  configsByType: Record<ConfigType, Array<PersistedConfig>> //store.select.globalConfig.configsByType(appState),
  defaultEntityTypeConfig: AppState["globalConfig"]["defaultEntityTypeConfig"] //appState.globalConfig.defaultEntityTypeConfig,
  entityTypes: Record<ConfigType, PersistedConfig> //store.select.globalConfig.entityTypeConfigs(appState),
  isDeletingRemoteConfig: boolean //appState.loading.effects.globalConfig.deleteRemoteConfigs,
  isUpdatingRemoteConfig: boolean //appState.loading.effects.globalConfig.updateRemoteConfig,
  loadByType: (type: string) => PersistedConfig[] | null
}

export type RemoteConfigActionParams = {
  dispatch: AppDispatch
  entityTypeId?: PersistedConfig["id"] // The type ID of the config to edit
  fromStore: RemoteConfigFromStore
  queryConfig: QueryConfig
  queryFormValues: JSONRecord
  remoteConfigStaticId?: PersistedConfig["id"] // A fixed config ID to fetch
  resultsType?: ResultsType
  uiDataSlice: UserInterfaceProps["data"]
  userInterfaceData: UserInterfaceProps["data"]
}

export type ExecuteRemoteConfigParams = RemoteConfigActionParams & {
  actionType: ActionType
}

export type ParsedConfig = {
  id: PersistedConfig["id"]
  name: PersistedConfig["name"]
  type: PersistedConfig["type"]
  type_id: PersistedConfig["type_id"]
  config: JSONRecord | null
}
