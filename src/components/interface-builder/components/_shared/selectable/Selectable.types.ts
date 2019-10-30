import { ComponentRenderMetaProps } from "../../base/BaseInterfaceComponent"
import { SelectablePropsLocalData } from "./Selectable.interfaces"

export type LocalDataHandlerType = "local"
export type LoadStatusType = "none" | "loading" | "loaded" | "error"
export type SelectableProps = (SelectablePropsLocalData) & ComponentRenderMetaProps
