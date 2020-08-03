import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { QueryConfig } from "../../../data/Report"
import { AppDispatch } from "../../../state/store.types"
import { confirmationType } from "../../query/types"

export type shapeType = "circle" | "circle-outline" | "round" | undefined
export type sizeType = "small" | "large" | undefined
export type buttonDisplayType = "primary" | "ghost" | "dashed" | "danger" | "link" | undefined

export type buttonProps = {
  component: "button"
  requireConfirmation: boolean
  confirmation?: confirmationType
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  buttonLabel: string
  icon: string
  hideButtonLabel: boolean
  shape: shapeType
  size: sizeType
  displayType: buttonDisplayType
  block: boolean
  ghost: boolean
}

interface ExecuteButtonProps {
  buttonProps: buttonProps
}

export interface IExecuteInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "query"
  components: ComponentDefinition[]
  executeImmediately?: boolean
  loadingKey?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  queryType: "remote-query" | "remote-query-update" | "remote-config" | "remote-url"
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
  outboundValueKey: string
  inboundApiKey: string
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
  isCRUD?: boolean
}

interface ExecuteRemoteConfigInterfaceComponentProps extends IExecuteInterfaceComponentProps {
  queryType: "remote-config"
  remoteConfigType?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
  isCRUD?: boolean
}

interface ExecuteRemoteUrlInterfaceComponentProps extends IExecuteInterfaceComponentProps {
  queryType: "remote-url"
  remoteUrl?: PersistedConfig["id"]
  remoteDataFilter?: JSONObject
  isCRUD?: boolean
}

export type ExecuteInterfaceComponentProps = (
  | ExecuteRemoteQueryInterfaceComponentProps
  | ExecuteRemoteConfigInterfaceComponentProps
  | ExecuteRemoteUrlInterfaceComponentProps
) &
  (ExecuteInterfaceComponentDisplayModeProps | ExecuteInterfaceComponentEditModeProps) &
  ExecuteButtonProps

export interface ExecuteInterfaceComponentState {
  data: any[]
  loadError: string | null
  loadStatus: "none" | "loading" | "loaded" | "error"
  formState: any
  /**
   * QueryConfig is type of taggedUnion:
   * ( HTTPRequestQueryConfigCodec | SQLQueryConfigCodec | StoredProcQueryConfigCodec )
   * from Reports.ts
   */
  queryConfig?: QueryConfig
}
