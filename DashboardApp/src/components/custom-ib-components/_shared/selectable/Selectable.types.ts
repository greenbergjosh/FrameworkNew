import { ComponentRenderMetaProps } from "@opg/interface-builder"
import {
  SelectablePropsLocalData,
  SelectablePropsRemoteConfigData,
  SelectablePropsRemoteKeyValueData,
  SelectablePropsRemoteQueryData,
  SelectablePropsRemoteURLData,
} from "./Selectable.interfaces"

export type LocalDataHandlerType = "local"
export type RemoteDataHandlerType = "remote-config" | "remote-kvp" | "remote-query" | "remote-url"
export type LoadStatusType = "none" | "loading" | "loaded" | "error"

export type SelectableProps = (
  | SelectablePropsLocalData
  | SelectablePropsRemoteConfigData
  | SelectablePropsRemoteKeyValueData
  | SelectablePropsRemoteQueryData
  | SelectablePropsRemoteURLData) &
  ComponentRenderMetaProps