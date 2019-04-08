import { Atom, swap, useAtom } from "@dbeining/react-atom"
import * as Reach from "@reach/router"
import { Card, Layout, Menu, Typography } from "antd"
import { filter } from "fp-ts/lib/Array"
import React from "react"
import { ConfigType } from "../../../../data/GlobalConfig.Config"
import { useRematch } from "../../../../hooks/use-rematch"
import { WithRouteProps } from "../../../../state/navigation"
import { store } from "../../../../state/store"

interface Props {}

const atom = Atom.of({
  configNameFilterValue: "",
  configTypesFilterValue: [] as Array<ConfigType>,
  siderCollapsed: false,
})

function setConfigNameFilterValue(evt: React.ChangeEvent<HTMLInputElement>): void {
  swap(atom, (s) => ({ ...s, configNameFilterValue: evt.target.value }))
}

function setConfigTypesFilterValue(xs: Array<ConfigType>): void {
  swap(atom, (s) => ({ ...s, configTypesFilterValue: xs }))
}

function setSiderCollapsed(didCollapse: boolean): void {
  swap(atom, (s) => ({ ...s, siderCollapsed: didCollapse }))
}
function toggleSiderCollapsed(): void {
  swap(atom, (s) => ({ ...s, siderCollapsed: !s.siderCollapsed }))
}

//
// ──────────────────────────────────────────────────────────────────────────────  ──────────
//   :::::: G L O B A L   C O N F I G   A D M I N : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────────────────────────
//

export function GlobalConfigAdmin({
  children,
  location,
  navigate,
  path,
  uri,
}: WithRouteProps<Props>): JSX.Element {
  const { configNameFilterValue, configTypesFilterValue } = useAtom(atom)
  const [{ configs }, dispatch] = useRematch((s) => ({
    configs: store.select.globalConfig.configsList(s),
    configTypes: store.select.globalConfig.configTypes(s),
  }))

  const filteredConfigs = React.useMemo(() => {
    return filter(configs, function byNameAndtype(config) {
      return (
        (config.name.toLowerCase().includes(configNameFilterValue.toLowerCase()) &&
          configTypesFilterValue.length === 0) ||
        configTypesFilterValue.some((type) => type === config.type)
      )
    })
  }, [configs, configNameFilterValue, configTypesFilterValue])

  React.useEffect(() => {
    dispatch.globalConfig.loadAllConfigsMetaOnly()
  }, [dispatch])

  return (
    <div>
      <Card>
        <Layout hasSider={true}>
          <Layout.Sider
            style={{ overflow: "auto", height: "100vh" }}
            theme="light"
            trigger={null}
            width={250}>
            <Menu theme="light" mode="inline">
              {filteredConfigs.map((config) => (
                <Menu.Item key={config.id}>
                  <Typography.Text>{config.name}</Typography.Text>
                  <Reach.Link to={config.id} />
                </Menu.Item>
              ))}
            </Menu>
          </Layout.Sider>

          <Layout.Content style={{ backgroundColor: "#fff" }}>{children}</Layout.Content>
        </Layout>
      </Card>
    </div>
  )
}
