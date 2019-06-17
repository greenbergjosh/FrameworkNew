import classNames from "classnames"
import React from "react"

export interface DroppablePlaceholderProps {
  className?: string
  text?: string
  width: number
  x: number
  y: number
}

export const DroppablePlaceholder = React.memo(
  ({ className, text, width, x, y }: DroppablePlaceholderProps) => (
    <div
      data-droppable-placeholder
      className={classNames("droppable-placeholder", className)}
      style={{
        // TODO: Figure out replacing with transform instead of top and left
        // transform: `translate(
        //   ${(placeholder || { y: 0 }).y}px,
        // ${(placeholder || { x: 0 }).x})px`,
        top: `${y}px`,
        left: `${x}px`,
        width: `${width}px`,
      }}>
      {text || "Drop Item Here"}
    </div>
  )
)
