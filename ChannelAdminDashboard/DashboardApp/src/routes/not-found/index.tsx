import * as Reach from "@reach/router"
import React from "react"
import { Helmet } from "react-helmet"

interface Props extends Reach.RouteComponentProps {}

export function NotFound(props: Props): JSX.Element {
  return (
    <div>
      <Helmet>
        <title>Error 404 | Channel Admin | OPG</title>
      </Helmet>

      <p>{`You seem lost. ${props.location && props.location.pathname} doesn't go anywhere`}</p>
    </div>
  )
}
