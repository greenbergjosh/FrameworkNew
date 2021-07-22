import React from "react"
import { EditableContextProps } from "../../contexts/EditableContext"
import { DraggedItemProps } from "../DragAndDrop"
import { IncomingEventHandler, OutgoingEventMap } from "components/withEvents/types"
import { ComponentDefinition, ComponentDefinitionNamedProps } from "globalTypes"

export type IEditButtons = (props: EditButtonsProps) => JSX.Element | null

export enum VISIBILITY_MODES {
  blocked = "blocked",
  default = "default",
  disabled = "disabled",
  invisible = "invisible",
  error = "error",
}

export interface EditPanelProps {
  componentDefinition: Partial<ComponentDefinitionNamedProps> | null
  showGripper?: boolean
  style?: React.CSSProperties
  title: string
  tools?: JSX.Element | null
  visibilityMode?: "default" | "invisible" | "disabled" | "blocked" | "user-interface" | "error"
}

export interface SummaryProps {
  incomingEventHandlers?: IncomingEventHandler[]
  outgoingEventMap?: OutgoingEventMap
}

export interface EditPanelWithToolsProps extends EditableContextProps {
  blocked?: boolean
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
