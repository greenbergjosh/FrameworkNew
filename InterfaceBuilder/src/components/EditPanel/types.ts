import React from "react"
import { EditableContextProps } from "../../contexts/EditableContext"
import { DraggedItemProps } from "../DragAndDrop"
import { ComponentDefinition, ComponentDefinitionNamedProps } from "../../globalTypes"
import { BaseInterfaceComponent } from "../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { EventMapItem } from "../../components/withEvents/types"

export type IEditButtons = (props: EditButtonsProps) => JSX.Element | null
export type EventMapItemKVP = [string, EventMapItem]

export enum VISIBILITY_MODES {
  blocked = "blocked",
  default = "default",
  disabled = "disabled",
  invisible = "invisible",
  error = "error",
}

export interface EditPanelProps {
  component?: typeof BaseInterfaceComponent
  componentDefinition: Partial<ComponentDefinitionNamedProps> | null
  showGripper?: boolean
  style?: React.CSSProperties
  title: string
  tools?: JSX.Element | null
  visibilityMode?: "default" | "invisible" | "disabled" | "blocked" | "user-interface" | "error"
}

export interface SummaryProps {
  component?: typeof BaseInterfaceComponent
  componentDefinition: Partial<ComponentDefinitionNamedProps> | null
}

export interface ComponentSummaryProps {
  summary: ComponentDefinitionNamedProps["summary"]
  className?: string
}

export interface EventsSummaryProps {
  incomingEventHandlers?: ComponentDefinitionNamedProps["incomingEventHandlers"]
  eventMapItems?: EventMapItemKVP[]
  className?: string
}

export interface EditPanelWithToolsProps extends EditableContextProps {
  blocked?: boolean
  component: typeof BaseInterfaceComponent
  componentDefinition: ComponentDefinition
  draggableItem?: DraggedItemProps
  editable?: boolean
  hasError?: boolean
  hidden?: boolean
  invisible?: boolean
  title: string
}

export interface EditButtonsProps {
  canDelete: EditableContextProps["canDelete"]
  canEdit: EditableContextProps["canEdit"]
  className?: string
  onDelete?: (event: unknown) => void // MouseEvent<HTMLElement, MouseEvent>
  onEdit?: (event: unknown) => void // MouseEvent<HTMLElement, MouseEvent>
  title?: string
}
