import { Button, Col, Dropdown, Icon, Layout, Menu, Row, Typography } from "antd"
import { identity } from "fp-ts/lib/function"
import { fromNullable, none } from "fp-ts/lib/Option"
import React from "react"

import { Atom, swap, useAtom } from "@dbeining/react-atom"
import * as Reach from "@reach/router"

import { useRematch } from "../../hooks/use-rematch"
import { RouteProps, RouteMeta } from "../../state/navigation"
import { store } from "../../state/store"
import styles from "./dashboard.module.css"

interface Props extends RouteProps {}

const atom = Atom.of({
  siderCollapsed: false,
})

function setSiderCollapsed(didCollapse: boolean): void {
  swap(atom, (s) => ({ ...s, siderCollapsed: didCollapse }))
}
function toggleSiderCollapsed(): void {
  swap(atom, (s) => ({ ...s, siderCollapsed: !s.siderCollapsed }))
}

export function Dashboard(props: Props): JSX.Element {
  const { siderCollapsed } = useAtom(atom)

  const [state, dispatch] = useRematch(store, (s) => ({
    iam: s.iam,
    paths: s.navigation.routes,
  }))

  const handleLogout = React.useCallback(() => {
    dispatch.iam.reset()
    dispatch.navigation.goToLanding(none)
  }, [dispatch])

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
          defaultOpenKeys={fromNullable(props.location)
            .map((l) =>
              props.subroutes
                .filter((sr) => l.pathname.includes(sr.abs))
                .map((sr) => sr.abs)
            )
            .fold([], identity)}
          selectedKeys={fromNullable(props.location)
            .map((l) => l.pathname)
            .fold([], (pn) => [pn])}>
          {(function renderRoutesAsMenuItems(routes: Array<RouteMeta>) {
            return routes
              .filter((route) => route.shouldAppearInSideNav)
              .map((route) => {
                return route.subroutes.some((route) => route.shouldAppearInSideNav) ? (
                  <Menu.SubMenu
                    key={route.abs}
                    title={
                      <span>
                        <Icon type={route.iconType} />
                        <span>{route.displayName}</span>
                      </span>
                    }>
                    {renderRoutesAsMenuItems(route.subroutes)}
                  </Menu.SubMenu>
                ) : (
                  <Menu.Item key={route.abs}>
                    <Icon type={route.iconType} />
                    <span>{route.displayName}</span>
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

            <Col push={20} span={2}>
              <Dropdown
                overlay={
                  <Menu
                    onClick={({ key }) =>
                      key === "logout" ? handleLogout() : () => null
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
              </Dropdown>
            </Col>
          </Row>
        </Layout.Header>

        <Layout.Content
          style={{
            overflow: "scroll",
          }}>
          <Row
            style={{
              margin: "24px 16px",
              minHeight: 280,
              padding: 24,
            }}>
            {props.children}
          </Row>

          <Layout.Footer style={{ textAlign: "center" }}>
            {`OnPoint Global © ${new Date().getFullYear()}`}
          </Layout.Footer>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
