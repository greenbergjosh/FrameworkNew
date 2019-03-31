import { Breadcrumb, Button, Col, Dropdown, Icon, Layout, Menu, Row, Typography } from "antd"
import { identity } from "fp-ts/lib/function"
import { fromNullable, none } from "fp-ts/lib/Option"
import React from "react"

import { Atom, swap, useAtom } from "@dbeining/react-atom"
import * as Reach from "@reach/router"

import { useRematch } from "../../hooks/use-rematch"
import { keys } from "../../lib/object"
import { RouteProps, RouteMeta } from "../../state/navigation"
import { store } from "../../state/store"
import styles from "./dashboard.module.css"

interface Props extends RouteProps {}

/* ----------- LOCAL STATE -------------- */
const atom = Atom.of({
  siderCollapsed: false,
})

function setSiderCollapsed(didCollapse: boolean): void {
  swap(atom, (s) => ({ ...s, siderCollapsed: didCollapse }))
}
function toggleSiderCollapsed(): void {
  swap(atom, (s) => ({ ...s, siderCollapsed: !s.siderCollapsed }))
}

/* ----------- END LOCAL STATE -------------- */

export function Dashboard({ children, location, subroutes }: Props): JSX.Element {
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
        onCollapse={setSiderCollapsed}>
        <div className={`${styles.logo} ${siderCollapsed ? styles.logoCollapsed : ""}`}>
          <Typography.Title level={4}>ONPOINT</Typography.Title>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          defaultOpenKeys={fromNullable(location)
            .map((l) => subroutes.filter((sr) => l.pathname.includes(sr.abs)).map((sr) => sr.abs))
            .fold([], identity)}
          selectedKeys={fromNullable(location)
            .map((l) => l.pathname)
            .fold([], (pn) => [pn])}>
          {(function renderRoutesAsMenuItems(routes: Array<RouteMeta>): Array<JSX.Element> {
            return routes.map((route) => {
              return keys(route.subroutes).length === 0 ? (
                <Menu.Item key={route.abs}>
                  <Icon type={route.iconType} />
                  <span>{route.displayName}</span>
                  <Reach.Link to={route.abs} />
                </Menu.Item>
              ) : (
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
              )
            })
          })(subroutes)}
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
                    onClick={({ key }) => {
                      switch (key) {
                        case "logout":
                          return handleLogout()
                        default:
                          break
                      }
                    }}>
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
          <Breadcrumb separator="/" style={{ padding: 15 }}>
            <Breadcrumb.Item key="/">
              <Icon type="home" />
            </Breadcrumb.Item>

            {fromNullable(location)
              .map((l) => {
                const subpaths = l.pathname.split("/").filter((x) => !!x)
                return subpaths.map((subpath, index) => {
                  const url = `/${subpaths.slice(0, index + 1).join("/")}`
                  return (
                    <Breadcrumb.Item key={url}>
                      <Reach.Link to={url}>{subpath}</Reach.Link>
                    </Breadcrumb.Item>
                  )
                })
              })
              .fold([], identity)}
          </Breadcrumb>

          <Row
            style={{
              margin: "24px 16px",
              minHeight: 280,
              padding: 24,
            }}>
            {children}
          </Row>

          <Layout.Footer style={{ textAlign: "center" }}>
            {`OnPoint Global © ${new Date().getFullYear()}`}
          </Layout.Footer>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
