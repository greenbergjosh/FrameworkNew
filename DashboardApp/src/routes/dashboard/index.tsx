import { Atom, swap, useAtom } from "@dbeining/react-atom"
import * as Reach from "@reach/router"
import { identity } from "fp-ts/lib/function"
import { some, toArray } from "fp-ts/lib/Record"
import React from "react"
import { Space } from "../../components/space"
import { useRematch } from "../../hooks"
import { Profile } from "../../state/iam"
import { RouteMeta, WithRouteProps } from "../../state/navigation"
import styles from "./dashboard.module.css"
import {
  Avatar,
  Breadcrumb,
  Button,
  Col,
  Dropdown,
  Icon,
  Layout,
  Menu,
  Row,
  Typography,
} from "antd"

interface Props {
  profile: Profile
}

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

  const [fromStore, dispatch] = useRematch((s) => ({
    profile: s.iam.profile,
  }))

  React.useEffect(() => {
    dispatch.globalConfig.loadRemoteConfigs()
  }, [dispatch])

  return (
    <Layout className={styles.fullHeight} hasSider={true}>
      <Layout.Sider
        collapsible={true}
        collapsed={siderCollapsed}
        trigger={null}
        width={200}
        onCollapse={setSiderCollapsed}>
        <div style={{ position: identity<"relative">("relative") }}>
          <div className={`${styles.logo} ${siderCollapsed ? styles.logoCollapsed : ""}`}>
            <Typography.Title level={4}>{siderCollapsed ? "OPG" : "ONPOINT"}</Typography.Title>
          </div>
          <Button
            className={styles.trigger}
            shape="circle-outline"
            size="large"
            onClick={toggleSiderCollapsed}>
            <Icon type={siderCollapsed ? "menu-unfold" : "menu-fold"} />
          </Button>
        </div>
        <Menu
          theme="dark"
          mode="vertical"
          defaultOpenKeys={activeMenuKeys}
          selectedKeys={activeMenuKeys}>
          {(function renderRoutesAsMenuItems(appRoutes: Record<string, RouteMeta>) {
            return toArray(appRoutes)
              .filter(([path, route]) => route.shouldAppearInSideNav)
              .map(([path, route]) => {
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
              .reverse()
          })(props.subroutes)}
        </Menu>
      </Layout.Sider>

      <Layout>
        <Layout.Header className={`${styles.layoutContainer} ${styles.topToolbar}`}>
          <Row align="middle" type="flex">
            <Col style={{ flex: 1 }}>
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
            <Col style={{ flex: 1 }}>
              <Row align="middle" justify="end" type="flex">
                {fromStore.profile
                  .map((profile) => (
                    <Dropdown
                      key={profile.email}
                      overlay={
                        <Menu
                          onClick={(evt) => {
                            if (evt.key === "logout") {
                              dispatch.iam.logout()
                            }
                          }}>
                          <Menu.Item key="username">
                            <span>{profile.name}</span>
                          </Menu.Item>
                          <Menu.Item key="email">
                            <Icon type="mail" />
                            <span>
                              <i>{profile.email}</i>
                            </span>
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item key="logout">
                            <Icon type="logout" />
                            <span>Logout</span>
                          </Menu.Item>
                        </Menu>
                      }
                      placement="bottomCenter"
                      trigger={["click"]}>
                      {profile.profileImage ? (
                        <Button shape="circle" htmlType="button">
                          <Avatar src={profile.profileImage} alt={profile.name} />
                        </Button>
                      ) : (
                        <Button icon="user" shape="circle" htmlType="button" />
                      )}
                    </Dropdown>
                  ))
                  .getOrElse(<></>)}
              </Row>
            </Col>
          </Row>
        </Layout.Header>
        <Row className={`${styles.layoutContainer} ${styles.breadCrumbsRow}`}>
          <Breadcrumb>
            {props.location.pathname.split("/").map((_, idx, parts) => (
              <Breadcrumb.Item key={parts.slice(0, idx + 1).join("/")}>
                <Reach.Link to={parts.slice(0, idx + 1).join("/")}>{parts[idx]}</Reach.Link>
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </Row>

        <Layout.Content className={`${styles.layoutContainer}`}>
          {props.children}
        </Layout.Content>

        <Layout.Footer className={`${styles.layoutContainer}`} style={{ textAlign: "center" }}>
          {`OnPoint Global © ${new Date().getFullYear()}`}
        </Layout.Footer>
      </Layout>
    </Layout>
  )
}

export default Dashboard
