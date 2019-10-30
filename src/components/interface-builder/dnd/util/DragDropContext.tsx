import React from "react"
import { DragDropContext } from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"
import TouchBackend from "react-dnd-touch-backend"

const DragAndDropHOC: React.FunctionComponent<{}> = (props) => {
  return <>{props.children}</>
}

export default {
  HTML5: DragDropContext(HTML5Backend)(DragAndDropHOC),
  //@ts-ignore
  Touch: DragDropContext(TouchBackend)(DragAndDropHOC),
}
