import { JSONRecord } from "../../globalTypes/JSONTypes"
import { BaseInterfaceComponent } from "./BaseInterfaceComponent"
import { ComponentDefinition, ComponentDefinitionNamedProps, ComponentRenderMetaProps } from "../../globalTypes"

export interface ChangeObject {
  [key: string]: unknown
}

export type DataBindings = { [K in keyof ComponentDefinitionNamedProps]: JSONRecord }
export type BaseInterfaceComponentProps = ComponentDefinition & ComponentRenderMetaProps
export type BaseInterfaceComponentType = typeof BaseInterfaceComponent
