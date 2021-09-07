import React from "react"
import { DroppablePlaceholderState, DroppableTargetProps, DraggedItemProps } from "../components/DragAndDrop"

export interface DroppableContextType {
  droppableId: string
  onDrop?: (draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps) => void
  orientation?: "vertical" | "horizontal"
  placeholder: DroppablePlaceholderState | null
}

export const DroppableContext = React.createContext<DroppableContextType | null>(null)
