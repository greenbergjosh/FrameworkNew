import { Col, Icon, Layout, Menu, Row, Typography, Breadcrumb } from "antd"
import React from "react"

import { Atom, swap, useAtom } from "@dbeining/react-atom"
import * as Reach from "@reach/router"
import { GoogleAuth } from "../../components/auth/GoogleAuth"
import { RouteMeta, WithRouteProps } from "../../state/navigation"
import styles from "./dashboard.module.css"
import { some, toArray } from "fp-ts/lib/Record"
import { Space } from "../../components/space"

interface Props {}

const atom = Atom.of({
  siderCollapsed: false,
})

function setSiderCollapsed(didCollapse: boolean): void {
  swap(atom, (s) => ({ ...s, siderCollapsed: didCollapse }))
}
function toggleSiderCollapsed(): void {
  swap(atom, (s) => ({ ...s, siderCollapsed: !s.siderCollapsed }))
}

export function Dashboard(props: WithRouteProps<Props>): JSX.Element {
  const { siderCollapsed } = useAtom(atom)
  const activeMenuKeys = React.useMemo(() => {
    return toArray(props.subroutes)
      .filter(([k, sr]) => props.location.pathname.includes(sr.abs))
      .map(([k, sr]) => sr.abs)
  }, [props.subroutes, props.location.pathname])

  return (
    <Layout className={styles.fullHeight} hasSider={true}>
      <Layout.Sider
        collapsible={true}
        collapsed={siderCollapsed}
        style={{ overflowY: "scroll" }}
        trigger={null}
        width={200}
        onCollapse={setSiderCollapsed}>
        <div className={`${styles.logo} ${siderCollapsed ? styles.logoCollapsed : ""}`}>
          <Typography.Title level={4}>ONPOINT</Typography.Title>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          defaultOpenKeys={activeMenuKeys}
          selectedKeys={activeMenuKeys}>
          {(function renderRoutesAsMenuItems(appRoutes: Record<string, RouteMeta>) {
            return toArray(appRoutes).map(([path, route]) => {
              return some(route.subroutes, (route) => route.shouldAppearInSideNav) ? (
                <Menu.SubMenu
                  key={route.abs}
                  title={
                    <span>
                      <Icon type={route.iconType} />
                      <span>{route.title}</span>
                    </span>
                  }>
                  {renderRoutesAsMenuItems(route.subroutes)}
                </Menu.SubMenu>
              ) : (
                <Menu.Item key={route.abs}>
                  <Icon type={route.iconType} />
                  <span>{route.title}</span>
                  <Reach.Link to={route.abs} />
                </Menu.Item>
              )
            })
          })(props.subroutes)}
        </Menu>
      </Layout.Sider>

      <Layout style={{ overflow: "hide" }}>
        <Layout.Header className={styles.topToolbar}>
          <Row align="middle">
            <Col span={2}>
              <Icon
                className={styles.trigger}
                type={siderCollapsed ? "menu-unfold" : "menu-fold"}
                onClick={toggleSiderCollapsed}
              />
            </Col>
            <Col span={20}>
              {toArray(props.subroutes).map(([path, subroute]) => (
                <Reach.Match key={subroute.abs} path={`${subroute.path}/*`}>
                  {({ match }) => {
                    if (!match) return
                    return (
                      <Row align="middle" style={{ display: "flex" }}>
                        <Col>
                          <Typography.Text strong={true}>{subroute.title}</Typography.Text>
                        </Col>
                        <Space.Vertical width={15} />
                        <Col>
                          <Typography.Text type="secondary">{subroute.description}</Typography.Text>
                        </Col>
                      </Row>
                    )
                  }}
                </Reach.Match>
              ))}
            </Col>
            <Col span={2}>
              <GoogleAuth />
              {/* <Dropdown
                overlay={
                  <Menu
                    onClick={({ key }) =>
                      key === "logout" ? dispatch.gapiAuth.signOut() : () => null
                    }>
                    <Menu.Item key="logout">
                      <Icon type="logout" />
                      <span>Logout</span>
                    </Menu.Item>
                  </Menu>
                }
                placement="bottomCenter"
                trigger={["click"]}>
                <Button icon="user" shape="circle" />
              </Dropdown> */}
            </Col>
          </Row>
        </Layout.Header>
        <Row style={{ padding: 12 }}>
          <Breadcrumb>
            {props.location.pathname.split("/").map((_, idx, parts) => (
              <Breadcrumb.Item key={parts.slice(0, idx + 1).join("/")}>
                <Reach.Link to={parts.slice(0, idx + 1).join("/")}>{parts[idx]}</Reach.Link>
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </Row>
        <Layout.Content style={{ overflow: "scroll" }}>
          <Row style={{ padding: 24 }}>{props.children}</Row>

          <Layout.Footer style={{ textAlign: "center" }}>
            {`OnPoint Global © ${new Date().getFullYear()}`}
          </Layout.Footer>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
