import { Card } from "antd"
import React from "react"
import { Helmet } from "react-helmet"
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
      <Helmet>
        <title>Manage Configurations | Channel Admin | OPG</title>
      </Helmet>

      {children}
    </Card>
  )
}

export default GlobalConfigAdmin
