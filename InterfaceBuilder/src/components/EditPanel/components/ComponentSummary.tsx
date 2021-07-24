import React from "react"
import { ComponentSummaryProps } from "../types"
import { isEmpty } from "lodash"

export const ComponentSummary: React.FC<ComponentSummaryProps> = (props): JSX.Element | null => {
  if (isEmpty(props.summary)) {
    return null
  }

  return <div className={props.className}>{props.summary}</div>
}
