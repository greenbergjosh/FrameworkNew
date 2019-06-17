import { Identifier } from "dnd-core"
import React from "react"
import { DragLayer, XYCoord } from "react-dnd"

const layerStyles: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
}

export interface CustomDragLayerProps {
  item?: any
  itemType?: Identifier | null
  initialOffset?: XYCoord | null
  currentOffset?: XYCoord | null
  isDragging?: boolean
}

const _CustomDragLayer: React.FC<CustomDragLayerProps> = (props) => {
  const { item, itemType, isDragging } = props

  console.log("_CustomDragLayer.render", props)

  function renderItem() {
    switch (itemType) {
      case "INTERFACE_COMPONENT":
        return <div>TEST</div>
      default:
        return <div>FAIL</div>
    }
  }

  if (!isDragging) {
    return null
  }
  return (
    <div style={layerStyles}>
      <div>{renderItem()}</div>
    </div>
  )
}

export const CustomDragLayer = DragLayer((monitor) => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging(),
}))(_CustomDragLayer)
