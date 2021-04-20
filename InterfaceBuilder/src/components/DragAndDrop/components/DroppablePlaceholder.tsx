import React from "react"
import classNames from "classnames"
import "../dnd.module.scss"

export interface DroppablePlaceholderProps {
  className?: string
  emptyContainer?: boolean
  horizontal?: boolean
  text?: string
  width: number | string
  x: number
  y: number
}

export const DroppablePlaceholder = React.memo(
  ({ className, emptyContainer, horizontal, text, width, x, y }: DroppablePlaceholderProps) => (
    <div
      data-droppable-placeholder
      className={classNames("droppable-placeholder", className, {
        "empty-container": emptyContainer,
        vertical: !horizontal,
        horizontal,
      })}
      style={
        emptyContainer
          ? {}
          : {
              // TODO: Figure out replacing with transform instead of top and left
              // transform: `translate(
              //   ${(placeholder || { y: 0 }).y}px,
              // ${(placeholder || { x: 0 }).x})px`,
              top: `${y}px`,
              left: `${x}px`,
              width: typeof width === "number" ? `${width}px` : width,
            }
      }>
      {text || "Drop Item Here"}
    </div>
  )
)
