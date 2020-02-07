import { XYCoord } from "react-dnd"

export function findDraggableOrPlaceholder(parentElement: Element, clientOffset: XYCoord | null) {
  if (clientOffset) {
    const cursorOverElement = document.elementFromPoint(clientOffset.x, clientOffset.y)

    let draggable: Element | null = null
    let droppable: Element | null = null

    let current = cursorOverElement
    while (current && !droppable) {
      if (current.hasAttribute("data-draggable-component")) {
        draggable = current
      } else if (current.hasAttribute("data-droppable-component")) {
        droppable = current
      } else if (current.hasAttribute("data-droppable-placeholder")) {
        draggable = current
      }

      current = current.parentElement
    }

    if (draggable && droppable === parentElement) {
      return draggable
    }

    return null
  }
}

export function isPlaceholderElement(element: Element) {
  return element.hasAttribute("data-droppable-placeholder")
}
