import React from "react"
import { ConnectDragSource, ConnectDropTarget } from "react-dnd"
import { DroppableContextType } from "../../contexts/DroppableContext"
import { ComponentDefinition } from "../../globalTypes"

export interface DraggedItemProps {
  draggableId: string
  index: number
  item: unknown
  parentDroppableId: string | null
  type: string | symbol
}

export interface DropHelperResult {
  components: ComponentDefinition[]
  itemToAdd: null | {
    componentDefinition: Partial<ComponentDefinition>
    path: string
    index: number
  }
  itemToEdit: null | {
    componentDefinition: Partial<ComponentDefinition>
    path: string
    index: number
  }
}

export const undraggableProps = {
  draggable: true,
  onDragStart: (e: { preventDefault: () => void; stopPropagation: () => void }): void => {
    e.preventDefault()
    e.stopPropagation()
  },
}

export interface UndraggableProps {
  wrap?: boolean | "shrink"
}

export interface DraggableInnerProps {
  children: (props: DraggableChildProps) => JSX.Element
  connectDragSource: ConnectDragSource
  data: unknown
  draggableId: string
  draggableItem: DraggedItemProps
  editable?: boolean
  index: number
  innerRef: React.RefObject<HTMLDivElement>
  isDragging: boolean
  makeRoomForPlaceholder: boolean
  orientation?: DroppableContextType["orientation"]
  parentDroppableId: string | null
  title: string
  type: string | symbol
}

export interface DraggableChildProps {
  data: unknown
  isDragging: boolean
  draggableItem: DraggedItemProps
}

export interface DraggableProps {
  children: (props: DraggableChildProps) => JSX.Element
  data: unknown
  draggableId: string
  editable?: boolean
  index: number
  title: string
  type: string | symbol
}

export interface DroppablePlaceholderState {
  index: number
  width: number
  x: number
  y: number
}

export interface DroppableTargetProps {
  disabled: boolean
  droppableId: string
  dropIndex: number
  type: string | symbol
}

export interface DroppableInnerProps {
  allowDrop?: boolean
  canDrop: boolean
  children: DroppableProps["children"]
  connectDropTarget: ConnectDropTarget
  disabled?: DroppableProps["disabled"]
  droppableId: DroppableProps["droppableId"]
  innerRef: React.RefObject<HTMLDivElement>
  isOver: boolean
  onDrop?: DroppableProps["onDrop"]
  orientation?: DroppableContextType["orientation"]
  placeholderText?: DroppableProps["placeholderText"]
  placeholder: DroppablePlaceholderState | null
  setPlaceholder: (placeholder: DroppablePlaceholderState | null) => void
  type: DroppableProps["type"]
}

export interface DroppableChildProps {
  isOver: boolean
}

export interface DroppableProps {
  allowDrop?: boolean
  children: (props: DroppableChildProps) => JSX.Element | JSX.Element[]
  data?: any
  disabled?: boolean
  droppableId: string
  onDrop?: DroppableContextType["onDrop"]
  orientation?: DroppableContextType["orientation"]
  placeholderText?: string
  type: string | symbol
}
