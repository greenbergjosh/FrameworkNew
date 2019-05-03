import { Card } from "antd"
import React from "react"
import { WithRouteProps } from "../../../../state/navigation"

interface Props {}

export function GlobalConfigAdmin({
  children,
  location,
  navigate,
  path,
  uri,
}: WithRouteProps<Props>): JSX.Element {
  return (
    <Card bordered={false} size="small">
      {children}
    </Card>
  )
}

export default GlobalConfigAdmin
