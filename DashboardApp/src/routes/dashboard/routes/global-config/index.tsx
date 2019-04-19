import { Atom } from "@dbeining/react-atom"
import * as Reach from "@reach/router"
import { Card } from "antd"
import React from "react"
import { useRematch } from "../../../../hooks/use-rematch"
import { WithRouteProps } from "../../../../state/navigation"
import { store } from "../../../../state/store"

interface Props {}

const atom = Atom.of({})

export function GlobalConfigAdmin({
  children,
  location,
  navigate,
  path,
  uri,
}: WithRouteProps<Props>): JSX.Element {
  const [fromStore, dispatch] = useRematch((s) => ({
    configs: s.globalConfig.configs,
    configsByType: store.select.globalConfig.configsByType(s),
    configTypes: store.select.globalConfig.configTypes(s),
    routes: s.navigation.routes,
  }))

  React.useEffect(() => {
    dispatch.globalConfig.loadRemoteConfigs()
  }, [dispatch])

  return (
    <Card bordered={false} size="small">
      {children}
    </Card>
  )
}
