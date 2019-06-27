import React from "react"
import { DraggedItemProps } from "./DroppableContext"

export interface DraggableContextProps {
  canPaste?: boolean
  onCopy?: (draggedItem: DraggedItemProps) => void
  onDelete?: (draggedItem: DraggedItemProps) => void
  onEdit?: (draggedItem: DraggedItemProps) => void
  onPaste?: (draggedItem: DraggedItemProps) => void
}

export const DraggableContext = React.createContext<DraggableContextProps | null>(null)
