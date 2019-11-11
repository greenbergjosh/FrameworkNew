import { ComponentRenderMetaProps } from "../../../base/BaseInterfaceComponent"
import {
  SelectInterfaceComponentPropsLocalData,
  SelectInterfaceComponentPropsRemoteConfigData,
  SelectInterfaceComponentPropsRemoteKeyValueData,
  SelectInterfaceComponentPropsRemoteQueryData, SelectInterfaceComponentPropsRemoteURLData,
} from "./interfaces"


export type LocalDataHandlerType = "local"
export type RemoteDataHandlerType = "remote-config" | "remote-kvp" | "remote-query" | "remote-url"
export type modeType = "default" | "multiple" | "tags"
export enum modes { default = "default", multiple = "multiple", tags = "tags" }
export type SelectInterfaceComponentProps = (
  | SelectInterfaceComponentPropsLocalData
  | SelectInterfaceComponentPropsRemoteConfigData
  | SelectInterfaceComponentPropsRemoteKeyValueData
  | SelectInterfaceComponentPropsRemoteQueryData
  | SelectInterfaceComponentPropsRemoteURLData) &
  ComponentRenderMetaProps