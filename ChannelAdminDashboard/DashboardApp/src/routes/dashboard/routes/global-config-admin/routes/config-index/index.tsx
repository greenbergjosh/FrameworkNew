import { Card, PageHeader, Menu, Layout, Typography } from "antd"
import { filter, takeWhile } from "fp-ts/lib/Array"
import React from "react"
import * as Reach from "@reach/router"

import { Atom, swap, useAtom } from "@dbeining/react-atom"

import { useRematch } from "../../../../../../hooks/use-rematch"
import { store } from "../../../../../../state/store"
import { Config, ConfigType } from "../../../../../../data/GlobalConfig.Config"
import { Route } from "antd/lib/breadcrumb/Breadcrumb"
import { RouteProps } from "../../../../../../state/navigation"

interface Props extends RouteProps {}

const atom = Atom.of({
  configNameFilterValue: "",
  configTypesFilterValue: [] as Array<ConfigType>,
  siderCollapsed: false,
})

function setSiderCollapsed(didCollapse: boolean): void {
  swap(atom, (s) => ({ ...s, siderCollapsed: didCollapse }))
}
function toggleSiderCollapsed(): void {
  swap(atom, (s) => ({ ...s, siderCollapsed: !s.siderCollapsed }))
}

//
// ────────────────────────────────────────────────────────────────  ──────────
//   :::::: C O N F I G   I N D E X : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────────────
//

export function ConfigIndex({
  children,
  location,
  navigate,
  path,
  uri,
}: Props): JSX.Element {
  const { configNameFilterValue, configTypesFilterValue } = useAtom(atom)
  const [{ configs }] = useRematch((s) => ({
    configs: s.globalConfig.configs,
    configTypes: store.select.globalConfig.configTypes(s),
  }))

  const filteredConfigs = React.useMemo(() => {
    return filter<Config>(configs, function byNameAndtype(config) {
      return (
        (config.Name.toLowerCase().includes(configNameFilterValue.toLowerCase()) &&
          configTypesFilterValue.length === 0) ||
        configTypesFilterValue.some((type) => type === config.Type)
      )
    })
  }, [configs, configNameFilterValue, configTypesFilterValue])

  return (
    <Reach.Location>
      {({ location }) => (
        <div>
          <PageHeader
            backIcon={false}
            breadcrumb={{
              routes: location.pathname.split("/").map((x) => ({
                path: takeWhile(location.pathname.split("/"), (y) => y !== x)
                  .concat([x])
                  .join("/"),
                breadcrumbName: x,
              })),
              itemRender(route: Route) {
                return <Reach.Link to={route.path}>{route.breadcrumbName}</Reach.Link>
              },
            }}
            subTitle="View and edit GlobalConfig.Config entries"
            title="Global Config Admin"
          />
          <Card>
            <Layout hasSider={true}>
              <Layout.Sider
                style={{ overflow: "auto", height: "100vh" }}
                theme="light"
                trigger={null}
                width={250}>
                <Menu theme="light" mode="inline">
                  {filteredConfigs.map((config) => (
                    <Menu.Item key={config.Id}>
                      <Typography.Text>{config.Name}</Typography.Text>
                      <Reach.Link to={config.Id} />
                    </Menu.Item>
                  ))}
                </Menu>
              </Layout.Sider>

              <Layout.Content style={{ backgroundColor: "#fff" }}>
                {children}
              </Layout.Content>
            </Layout>
          </Card>
        </div>
      )}
    </Reach.Location>
  )
}
