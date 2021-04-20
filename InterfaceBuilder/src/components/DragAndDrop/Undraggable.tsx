import React from "react"
import { undraggableProps, UndraggableProps } from "./types"

export const Undraggable: React.FunctionComponent<UndraggableProps> = ({ children, wrap }) => {
  switch (wrap) {
    case "shrink":
      return (
        <div {...undraggableProps} style={{ display: "inline-block" }}>
          {children}
        </div>
      )
    case true:
      return <div {...undraggableProps}>{children}</div>
    default:
      const undraggableChildren = React.Children.map(children, (child, index) => {
        return React.cloneElement(child as React.ReactElement<any>, undraggableProps)
      })
      return <>{undraggableChildren}</>
  }
}
