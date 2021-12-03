import React from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"

const withHTML5DragDropContext: React.FunctionComponent<Record<string, unknown>> = (props) => {
  return <DndProvider backend={HTML5Backend}>{props.children}</DndProvider>
}

const withTouchDragDropContext: React.FunctionComponent<Record<string, unknown>> = (props) => {
  return <DndProvider backend={TouchBackend}>{props.children}</DndProvider>
}

export default {
  HTML5: withHTML5DragDropContext,
  Touch: withTouchDragDropContext,
}
