import React from "react"

import { RouteProps } from "../../../../state/navigation"

interface Props extends RouteProps {}

//
// ──────────────────────────────────────────────────────────────────────────────  ──────────
//   :::::: G L O B A L   C O N F I G   A D M I N : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────────────────────────
//

export function GlobalConfigAdmin(props: Props): JSX.Element {
  return <>{props.children}</>
}
