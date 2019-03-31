import React from "react"
import * as Reach from "@reach/router"

interface Props extends Reach.RouteComponentProps {}

export function NotFound(props: Props): JSX.Element {
  return (
    <div>
      <p>{`You seem lost. ${props.location && props.location.pathname} doesn't go anywhere`}</p>
    </div>
  )
}
