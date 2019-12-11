import classNames from "classnames"
import React from "react"
import {
  ConnectDropTarget,
  DropTarget,
  DropTargetConnector,
  DropTargetMonitor
  } from "react-dnd"
import { DraggableInnerProps } from "./Draggable"
import {
  DraggedItemProps,
  DroppableContext,
  DroppableContextType,
  DroppablePlaceholder,
  DroppablePlaceholderState,
  findDraggableOrPlaceholder,
  isPlaceholderElement,
  isShallowEqual,
  shallowPropCheck,
} from "./util"

const dropHandlers = {
  // canDrop(props: DroppableInnerProps) {
  //   return props.allowDrop !== false
  // },
  hover: function(props: DroppableInnerProps, monitor: DropTargetMonitor, component: any) {
    const item = monitor.getItem() as DraggableInnerProps
    const { index: draggedIndex, draggableId, parentDroppableId } = item
    const {
      allowDrop,
      innerRef: { current: droppableElement },
      placeholder,
      droppableId,
    } = props

    if (droppableElement && allowDrop) {
      // Determine the child element being hovered over
      const clientOffset = monitor.getClientOffset()
      const hoverElement = findDraggableOrPlaceholder(droppableElement, clientOffset)

      if (hoverElement) {
        if (isPlaceholderElement(hoverElement)) return

        const simpleHoverIndex = [...droppableElement.children].findIndex(
          (child) => child === hoverElement
        )

        const isHoveringOriginal =
          draggedIndex === simpleHoverIndex && parentDroppableId === droppableId

        if (!isHoveringOriginal) {
          // find the middle of things
          const hoverBoundingRect = hoverElement.getBoundingClientRect()
          const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
          const hoverClientY = clientOffset ? clientOffset.y - hoverBoundingRect.top : 0

          const hoveredIndex = hoverClientY > hoverMiddleY ? simpleHoverIndex + 1 : simpleHoverIndex

          // Don't adjust until we are halfway over the Draggable
          if (draggedIndex < hoveredIndex && hoverClientY < hoverMiddleY) return
          if (draggedIndex > hoveredIndex && hoverClientY > hoverMiddleY) return

          // If the adjusted index would put this item back into the same place it was pulled from
          // then don't
          if (draggedIndex === hoveredIndex && parentDroppableId === droppableId) return
          const droppableBoundingRect = droppableElement.getBoundingClientRect()

          if (hoveredIndex >= droppableElement.children.length - (placeholder ? 1 : 0)) {
            const finalHoverElement = droppableElement.children.item(
              droppableElement.children.length - (placeholder ? 2 : 1)
            )

            if (finalHoverElement) {
              const finalHoverBoundingRect = finalHoverElement.getBoundingClientRect()

              // insert a display placeholder at an appropriate position
              // const dragDir = draggedIndex > hoveredIndex ? "up" : "down"
              const newPlaceholder = {
                index: hoveredIndex,
                x: finalHoverBoundingRect.left - droppableBoundingRect.left + 5,
                y: finalHoverBoundingRect.bottom - droppableBoundingRect.top + 10,
                width: finalHoverBoundingRect.width - 10,
              }

              // Don't update the state unless the state has actually changed
              if (!isShallowEqual(newPlaceholder, placeholder)) {
                // console.log("Droppable.hover", "result", { newPlaceholder, finalHoverElement })
                props.setPlaceholder(newPlaceholder)
              } else {
                // console.log("Droppable.hover", "result", "Do Nothing")
              }
            } else {
              // console.log("Droppable.hover", "result", "Do Nothing")
            }
            return
          } else {
            const finalHoverElement = droppableElement.children.item(hoveredIndex)

            if (finalHoverElement) {
              const finalHoverBoundingRect = finalHoverElement.getBoundingClientRect()

              // insert a display placeholder at an appropriate position
              const newPlaceholder = {
                index: hoveredIndex,
                x: finalHoverBoundingRect.left - droppableBoundingRect.left + 5,
                y: finalHoverBoundingRect.top - droppableBoundingRect.top + 5,
                width: finalHoverBoundingRect.width - 10,
              }

              // Don't update the state unless the state has actually changed
              if (!isShallowEqual(newPlaceholder, placeholder)) {
                // console.log("Droppable.hover", "result", { newPlaceholder })
                props.setPlaceholder(newPlaceholder)
              } else {
                // console.log("Droppable.hover", "result", "Do Nothing")
              }
            } else {
              // console.log("Droppable.hover", "result", "Do Nothing")
            }
            return
          }
        } else {
          // If we're hovering the original item, don't show a placeholder
        }
      } else {
        // Not hovrering any particular element, placeholder should go to the top or bottom
        // Determine bounds of Droppable
        const droppableBoundingRect = droppableElement.getBoundingClientRect()
        // Determine pointer position
        const clientOffset = monitor.getClientOffset()

        if (clientOffset) {
          // If we're close to the top
          if (clientOffset.y - droppableBoundingRect.top < 30) {
            const hoveredIndex = 0
            // If this was already the top item in this list, then bail
            if (draggedIndex === hoveredIndex && parentDroppableId === droppableId) return
            // Simulate hovering the 0th item
            const fauxHoveredElement = droppableElement.children.item(hoveredIndex)
            if (fauxHoveredElement && !isPlaceholderElement(fauxHoveredElement)) {
              const hoverBoundingRect = fauxHoveredElement.getBoundingClientRect()
              const newPlaceholder = {
                index: hoveredIndex,
                x: hoverBoundingRect.left - droppableBoundingRect.left + 5,
                y: hoverBoundingRect.top - droppableBoundingRect.top + 5,
                width: hoverBoundingRect.width - 10,
              }

              // Don't update the state unless the state has actually changed
              if (!isShallowEqual(newPlaceholder, placeholder)) {
                // console.log("Droppable.hover", "result", { newPlaceholder })
                props.setPlaceholder(newPlaceholder)
              } else {
                // console.log("Droppable.hover", "result", "Do Nothing")
              }
              return
            }
          }
          // If we're close to the bottom
          else if (droppableBoundingRect.bottom - clientOffset.y < (placeholder ? 130 : 30)) {
            const hoveredIndex = droppableElement.children.length - (placeholder ? 1 : 0)
            // If this was already the bottom item in this list, then bail
            if (
              (draggedIndex === hoveredIndex ||
                (draggedIndex === hoveredIndex - 1 &&
                  hoveredIndex === droppableElement.children.length)) &&
              parentDroppableId === droppableId
            )
              return
            // Simulate hovering the last item
            const fauxHoveredElement = droppableElement.children.item(hoveredIndex - 1)
            if (fauxHoveredElement && !isPlaceholderElement(fauxHoveredElement)) {
              const hoverBoundingRect = fauxHoveredElement.getBoundingClientRect()
              const newPlaceholder = {
                index: hoveredIndex,
                x: hoverBoundingRect.left - droppableBoundingRect.left + 5,
                y: hoverBoundingRect.bottom - droppableBoundingRect.top + 10,
                width: hoverBoundingRect.width - 10,
              }

              // Don't update the state unless the state has actually changed
              if (!isShallowEqual(newPlaceholder, placeholder)) {
                // console.log("Droppable.hover", "result", { newPlaceholder, fauxHoveredElement })
                props.setPlaceholder(newPlaceholder)
              } else {
                // console.log("Droppable.hover", "result", "Do Nothing")
              }
              return
            }
          }
        }
      }
    } else {
      // If there's no Droppable element
    }
    if (placeholder !== null) {
      // console.log("Droppable.hover", "result", "Remove placeholder")
      props.setPlaceholder(null)
    } else {
      // console.log("Droppable.hover", "result", "Do Nothing")
    }
  },

  drop(props: DroppableInnerProps, monitor: DropTargetMonitor) {
    // Just in case this drop has already been dropped
    if (monitor.didDrop()) return

    // Get the item that was being dragged from the monitory
    const droppedItem = monitor.getItem() as DraggedItemProps

    const { disabled, droppableId, innerRef, onDrop, placeholder, setPlaceholder, type } = props

    // If there is a specified onDrop on the props or in the ancestor chain
    if (onDrop) {
      let dropIndex = 0
      if (placeholder && typeof placeholder.index === "number" && !isNaN(placeholder.index)) {
        dropIndex = placeholder.index
      } else if (innerRef.current) {
        dropIndex = innerRef.current.children.length
      }

      // Invoke the drop handler with the dropped item and a few of this droppable's props
      onDrop(droppedItem, {
        disabled: !!disabled,
        droppableId,
        dropIndex,
        type,
      })
    }

    // Regardless of the validity of the drop, clear the placeholder
    setPlaceholder(null)
    return props
  },
}

function collect(connect: DropTargetConnector, monitor: DropTargetMonitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
  }
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

function DroppableInner({
  allowDrop,
  canDrop,
  children,
  connectDropTarget,
  droppableId,
  innerRef,
  isOver,
  orientation = "vertical",
  placeholder,
  placeholderText,
  setPlaceholder,
}: DroppableInnerProps) {
  const childrenResult = children({ isOver })
  const childCount = Array.isArray(childrenResult) ? childrenResult.length : 1
  const emptyContainer = childCount === 0
  // console.log("DroppableInner.render", { childrenResult, childCount })
  const horizontal = orientation === "horizontal"
  return connectDropTarget(
    <div
      data-droppable-component
      className={classNames("dnd-droppable", {
        "accept-drop": canDrop && isOver && allowDrop,
        "has-placeholder": !!placeholder && canDrop && isOver && allowDrop,
        vertical: !horizontal,
        horizontal: horizontal,
      })}
      ref={innerRef}>
      {/* Id {droppableId} | Placeholder at{" "}
      {placeholder && `index: ${placeholder.index} (${placeholder.x}, ${placeholder.y})`} | Child
      Count: {childCount} */}
      {childrenResult}
      {allowDrop && ((placeholder && isOver) || emptyContainer) && (
        <DroppablePlaceholder
          emptyContainer={emptyContainer}
          horizontal={horizontal}
          text={placeholderText}
          x={(placeholder || { x: 5 }).x}
          y={(placeholder || { y: 5 }).y}
          width={(placeholder || { width: "95%" }).width}
        />
      )}
    </div>
  )
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

    console.log("Droppable.memo.render")

    const [placeholder, setPlaceholder] = React.useState<DroppablePlaceholderState | null>(null)

    const parentDroppableContext = React.useContext(DroppableContext)
    const finalDropHandler =
      onDrop || (parentDroppableContext ? parentDroppableContext.onDrop : void 0)

    return (
      <DroppableContext.Provider
        value={{ droppableId, onDrop: finalDropHandler, orientation, placeholder }}>
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
