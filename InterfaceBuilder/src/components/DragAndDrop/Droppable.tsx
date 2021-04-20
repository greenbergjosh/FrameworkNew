import React from "react"
import { DropTarget, DropTargetConnector, DropTargetMonitor } from "react-dnd"
import { DroppableContext} from "../../contexts/DroppableContext"
import { shallowPropCheck } from "../../lib/shallowPropCheck"
import { DroppablePlaceholderState, DroppableProps } from "./types"
import { DroppableInner } from "./components/DroppableInner"
import { dropHandlers } from "./lib/dropHandlers.js"
import "./dnd.module.scss"

function collect(connect: DropTargetConnector, monitor: DropTargetMonitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
  }
}

const DroppableComponent = DropTarget(({ type }) => type, dropHandlers, collect)(DroppableInner)

export const Droppable = React.memo(
  ({
    allowDrop = true,
    children,
    disabled,
    droppableId,
    onDrop,
    orientation,
    placeholderText,
    type,
  }: DroppableProps) => {
    const innerRef = React.useRef(null)

    // console.log("Droppable.memo.render")

    const [placeholder, setPlaceholder] = React.useState<DroppablePlaceholderState | null>(null)

    const parentDroppableContext = React.useContext(DroppableContext)
    const finalDropHandler = onDrop || (parentDroppableContext ? parentDroppableContext.onDrop : void 0)

    return (
      <DroppableContext.Provider value={{ droppableId, onDrop: finalDropHandler, orientation, placeholder }}>
        <DroppableComponent
          allowDrop={allowDrop}
          disabled={disabled}
          droppableId={droppableId}
          innerRef={innerRef}
          onDrop={finalDropHandler}
          orientation={orientation}
          placeholder={placeholder}
          setPlaceholder={setPlaceholder}
          placeholderText={placeholderText}
          type={type}>
          {children}
        </DroppableComponent>
      </DroppableContext.Provider>
    )
  },
  shallowPropCheck(["allowDrop", "data", "disabled", "droppableId", "type"])
)
