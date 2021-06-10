import React from "react"
import { EditableContextProps } from "../../contexts/EditableContext"
import { DraggedItemProps } from "../DragAndDrop"

export type IEditButtons = (props: EditButtonsProps) => JSX.Element | null

export enum VISIBILITY_MODES {
  blocked = "blocked",
  default = "default",
  disabled = "disabled",
  invisible = "invisible",
  error = "error",
}

export interface EditPanelProps {
  showGripper?: boolean
  style?: React.CSSProperties
  title: string
  tools?: JSX.Element | null
  visibilityMode?: "default" | "invisible" | "disabled" | "blocked" | "user-interface" | "error"
}

export interface EditPanelWithToolsProps extends EditableContextProps {
  blocked?: boolean
  draggableItem?: DraggedItemProps
  editable?: boolean
  hidden?: boolean
  invisible?: boolean
  title: string
  hasError?: boolean
}

export interface EditButtonsProps {
  canDelete: EditableContextProps["canDelete"]
  canEdit: EditableContextProps["canEdit"]
  className?: string
  onDelete?: (event: unknown) => void // MouseEvent<HTMLElement, MouseEvent>
  onEdit?: (event: unknown) => void // MouseEvent<HTMLElement, MouseEvent>
  title?: string
}
