import { Atom, swap, useAtom } from "@dbeining/react-atom"
import * as Reach from "@reach/router"
import {
  AutoComplete,
  Button,
  Card,
  Divider,
  Empty,
  Icon,
  Input,
  Layout,
  Menu,
  Row,
  Select,
  Skeleton,
  Typography,
} from "antd"
import { array, empty, isEmpty, makeBy } from "fp-ts/lib/Array"
import { identity } from "fp-ts/lib/function"
import { Identity } from "fp-ts/lib/Identity"
import { fromNullable, none, some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import React from "react"
import { Space } from "../../../../components/space"
import { ConfigType, Config, InProgressDraftConfig } from "../../../../data/GlobalConfig.Config"
import { useRematch } from "../../../../hooks/use-rematch"
import { WithRouteProps } from "../../../../state/navigation"
import { store } from "../../../../state/store"
import styles from "./global-config-admin.module.css"

interface Props {}

const atom = Atom.of({
  configNameFilterValue: "",
  configTypesFilterValue: [] as Array<ConfigType>,
  siderCollapsed: false,
  siderMenuOpenKeys: empty as Array<string>,
})

function clearConfigNameFilterValue() {
  swap(atom, (s) => ({ ...s, configNameFilterValue: "" }))
}
function setConfigNameFilterValueFromInputChange(evt: React.ChangeEvent<HTMLInputElement>): void {
  swap(atom, (s) => ({ ...s, configNameFilterValue: evt.target.value }))
}

function setConfigNameFilterValue(value: string): void {
  swap(atom, (s) => ({ ...s, configNameFilterValue: value }))
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

function setSiderMenuOpenKeys(xs: Array<ConfigType>): void {
  swap(atom, (s) => ({ ...s, siderMenuOpenKeys: xs }))
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
  const { configNameFilterValue, configTypesFilterValue, siderMenuOpenKeys } = useAtom(atom)
  const [fromStore, dispatch] = useRematch((s) => ({
    configs: s.globalConfig.configs,
    configsByType: store.select.globalConfig.configsByType(s),
    configTypes: store.select.globalConfig.configTypes(s),
    routes: s.navigation.routes,
  }))

  const configsByTypeFiltered = React.useMemo(() => {
    return new Identity(fromStore.configsByType)
      .map(dict => record.filterWithKey(dict, (type) => configTypesFilterValue.includes(type) || isEmpty(configTypesFilterValue)))
      .map(dict => record.map(dict, cs => cs.filter(c => c.name.toLowerCase().includes(configNameFilterValue.toLowerCase()))))
      .fold(identity) // prettier-ignore
  }, [fromStore.configsByType, configNameFilterValue, configTypesFilterValue])

  React.useEffect(() => {
    // dispatch.globalConfig.loadRemoteConfigs()
  }, [dispatch])

  return (
    <Card>
      <Layout hasSider={true} style={{ backgroundColor: "#fff" }}>
        <Layout.Sider
          collapsible={true}
          style={{ position: "relative", height: "100%" }}
          theme="light"
          trigger={null}
          width={250}>
          <AutoComplete
            dataSource={record.toArray(configsByTypeFiltered).map(([type, configs]) => (
              <AutoComplete.OptGroup key={type} label={type}>
                {configs.map((c) => (
                  <AutoComplete.Option key={c.id} value={c.id}>
                    <Reach.Link to={c.id}>{c.name}</Reach.Link>
                  </AutoComplete.Option>
                ))}
              </AutoComplete.OptGroup>
            ))}
            onSearch={setConfigNameFilterValue}
            onSelect={clearConfigNameFilterValue}
            style={{ width: "100%" }}
            value={configNameFilterValue}>
            <Input.Search
              placeholder="Search by Config.Name"
              value={configNameFilterValue}
              onChange={setConfigNameFilterValueFromInputChange}
            />
          </AutoComplete>
          <Space.Horizontal height={16} />
          <Select
            allowClear={true}
            autoClearSearchValue={true}
            maxTagCount={0}
            maxTagPlaceholder={`${configTypesFilterValue.length} config type selected`}
            mode="multiple"
            suffixIcon={<Icon type="filter" />}
            style={{ width: "100%" }}
            placeholder="Filter by Config.Type"
            showArrow={true}
            value={configTypesFilterValue}
            onChange={setConfigTypesFilterValue}>
            {fromStore.configTypes.map((type) => (
              <Select.Option key={type}>{type}</Select.Option>
            ))}
          </Select>
          <Divider />

          <Row align="middle" style={{ textAlign: "center" }}>
            <Typography.Title level={4}>
              <Icon type="ordered-list" /> Configs by Type
            </Typography.Title>
          </Row>
          <Reach.Match
            path={fromStore.routes.dashboard.subroutes["global-config"].subroutes[":configId"].abs}>
            {({ match }: Reach.MatchRenderProps<{ configId: string }>) => {
              const focuseConfigTypes = fromNullable(match).map(({ configId }) => {
                return array.filterMap(record.toArray(configsByTypeFiltered), ([type, configs]) =>
                  configs.some((c) => c.id === configId) ? some(type) : none
                )
              })

              return (
                <Menu
                  theme="light"
                  mode="inline"
                  selectedKeys={match ? [match.configId] : empty}
                  openKeys={focuseConfigTypes.fold(siderMenuOpenKeys, (ts) =>
                    siderMenuOpenKeys === empty ? ts.concat(siderMenuOpenKeys) : siderMenuOpenKeys
                  )}
                  style={{ border: "none", height: "100%", overflowY: "scroll" }}
                  onOpenChange={setSiderMenuOpenKeys}>
                  {fromStore.configs.isPending() &&
                    makeBy(10, (n) => (
                      <Menu.Item key={n}>
                        <Skeleton
                          active={true}
                          loading={fromStore.configs.isPending()}
                          paragraph={false}
                          title={true}
                        />
                      </Menu.Item>
                    ))}
                  {record.toArray(configsByTypeFiltered).map(([type, configs]) => (
                    <Menu.SubMenu
                      key={type}
                      title={
                        <Typography.Text type="secondary" strong={true}>
                          {type}
                        </Typography.Text>
                      }>
                      {isEmpty(configs) ? (
                        <Empty />
                      ) : (
                        configs.map((config) => (
                          <Menu.Item key={config.id} title={config.name}>
                            <Typography.Text>{config.name}</Typography.Text>
                            <Reach.Link to={config.id} />
                          </Menu.Item>
                        ))
                      )}
                    </Menu.SubMenu>
                  ))}
                </Menu>
              )
            }}
          </Reach.Match>
        </Layout.Sider>
        <Space.Vertical width={16} />
        <Layout.Content
          className={`${styles.mainContent}`}
          style={{ backgroundColor: "#fff", paddingTop: 0 }}>
          <Reach.Match
            path={fromStore.routes.dashboard.subroutes["global-config"].subroutes[":configId"].abs}>
            {({ match }: Reach.MatchRenderProps<{ configId: string }>) => {
              const draftConfig: InProgressDraftConfig = {
                config: "{}",
                draftId: "create",
                language: "json",
                name: "",
                type: "",
              }
              if (match) return null
              return (
                <Row align="top" justify="center" type="flex" style={{ height: "100%" }}>
                  <Card bordered={false}>
                    <Space.Horizontal height={128} />

                    <Row align="middle" justify="center" type="flex" style={{ height: "100%" }}>
                      <Typography.Title level={4}>
                        <Icon type="select" /> Select a Config
                      </Typography.Title>
                      <Divider dashed={true}>
                        <Typography.Text type="secondary" strong={true}>
                          OR
                        </Typography.Text>
                      </Divider>
                      <Button
                        size="large"
                        type="primary"
                        onClick={() => {
                          dispatch.globalConfig.insertLocalDraftConfig(draftConfig)
                        }}>
                        <Reach.Link to={draftConfig.draftId}>
                          <Icon type="file-add" /> Create a new config
                        </Reach.Link>
                      </Button>
                    </Row>
                  </Card>
                </Row>
              )
            }}
          </Reach.Match>
          {children}
        </Layout.Content>
      </Layout>
    </Card>
  )
}
