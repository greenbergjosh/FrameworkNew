import React from "react"
import { DropTarget, DropTargetConnector, DropTargetMonitor } from "react-dnd"
import { DroppableContext } from "../../contexts/DroppableContext"
import { shallowPropCheck } from "./lib/shallowPropCheck"
import { DroppablePlaceholderState, DroppableProps } from "./types"
import { DroppableInner } from "./components/DroppableInner"
import { dropHandlers } from "./lib/dropHandlers"
import { isEqual } from "lodash/fp"
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
  propsAreEqual
)

function propsAreEqual(prevProps: DroppableProps, nextProps: DroppableProps) {
  const eqAllowDrop = isEqual(prevProps.allowDrop, nextProps.allowDrop)

  // TODO: [CHN-492] Optimize prop checking -- When the user enters a change in the column's
  //  edit mode and we're using isEqual, the props appear unchanged by value, so changes aren't
  //  merged into the model. When using shallowPropCheck, nested objects appear different
  //  by identity so the view is re-rendered.
  // const eqData = isEqual(prevProps.data, nextProps.data)
  const eqData = shallowPropCheck(["data"])(prevProps, nextProps)

  const eqDisabled = isEqual(prevProps.disabled, nextProps.disabled)
  const eqDroppableId = isEqual(prevProps.droppableId, nextProps.droppableId)
  const eqType = isEqual(prevProps.type, nextProps.type)

  return eqData && eqAllowDrop && eqDisabled && eqDroppableId && eqType
}
