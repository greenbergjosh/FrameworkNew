import { DraggableInnerProps, DroppableInnerProps } from "../../../components/DragAndDrop/types"
import { DropTargetMonitor } from "react-dnd"
import {
  findDraggableOrPlaceholder,
  isPlaceholderElement,
} from "../../../components/DragAndDrop/lib/placeholder-helpers"
import { isShallowEqual } from "../../../lib/isShallowEqual"
import { DraggedItemProps } from "../types"

export const dropHandlers = {
  // canDrop(props: DroppableInnerProps) {
  //   return props.allowDrop !== false
  // },
  hover(props: DroppableInnerProps, monitor: DropTargetMonitor /*, component: any*/) {
    const item = monitor.getItem() as DraggableInnerProps
    const { index: draggedIndex, /*draggableId,*/ parentDroppableId } = item
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

        const simpleHoverIndex = [...droppableElement.children].findIndex((child) => child === hoverElement)

        const isHoveringOriginal = draggedIndex === simpleHoverIndex && parentDroppableId === droppableId

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
          }
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
        // If we're hovering the original item, don't show a placeholder
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
                (draggedIndex === hoveredIndex - 1 && hoveredIndex === droppableElement.children.length)) &&
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
