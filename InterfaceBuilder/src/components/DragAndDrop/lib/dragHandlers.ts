import { DraggableInnerProps } from "components/DragAndDrop"
import { DraggedItemProps } from "../types"

export const dragHandlers = {
  beginDrag(props: DraggableInnerProps): DraggedItemProps {
    return {
      draggableId: props.draggableId,
      index: props.index,
      item: props.data,
      parentDroppableId: props.parentDroppableId,
      type: props.type,
    }
  },
}
