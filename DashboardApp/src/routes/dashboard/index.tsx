import { Atom, swap, useAtom } from "@dbeining/react-atom"
import * as Reach from "@reach/router"
import classNames from "classnames"
import { identity } from "fp-ts/lib/function"
import { toArray } from "fp-ts/lib/Record"
import React from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import { BusinessApplication } from "../../components/business-application/BusinessApplication"
import { Space } from "../../components/space"
import { useRematch } from "../../hooks"
import { guidRegex } from "../../lib/regexp"
import { Profile } from "../../state/iam"
import { NavigationGroupWithChildren, NavigationItem, WithRouteProps } from "../../state/navigation"
import { store } from "../../state/store"
import styles from "./dashboard.module.css"
import {
  Avatar,
  Breadcrumb,
  Button,
  Carousel,
  Col,
  Dropdown,
  Icon,
  Layout,
  Menu,
  message,
  Row,
  Spin,
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

  const [fromStore, dispatch] = useRematch((appState) => ({
    configsById: store.select.globalConfig.configsById(appState),
    profile: appState.iam.profile,
    loadingGlobalConfigs: appState.loading.effects.globalConfig.loadRemoteConfigs,
    navigation: store.select.navigation.primaryNavigation(appState),
  }))

  const navigationDepthComponentRef: React.Ref<Carousel> = React.useRef(null)

  // Determine if we're rendering the special case for business apps
  const isBusinessApp = props.location.pathname.split("/")[2] === "apps"
  const businessAppId = isBusinessApp ? props.location.pathname.split("/")[3] : null

  const nestedNavigation = React.useMemo(
    () => (isBusinessApp ? BusinessApplication.generateNavigation(businessAppId || "", fromStore.configsById) : null),
    [isBusinessApp, businessAppId, fromStore.configsById]
  )

  React.useEffect(() => {
    if (navigationDepthComponentRef.current) {
      if (businessAppId && nestedNavigation) {
        navigationDepthComponentRef.current.goTo(1)
      } else {
        navigationDepthComponentRef.current.goTo(0)
      }
    }
  }, [businessAppId, nestedNavigation, navigationDepthComponentRef.current])

  const showPrimaryNavigation = React.useCallback(() => {
    if (navigationDepthComponentRef.current) {
      navigationDepthComponentRef.current.goTo(0)
    }
  }, [navigationDepthComponentRef.current])

  const showNestedNavigation = React.useCallback(() => {
    if (navigationDepthComponentRef.current) {
      navigationDepthComponentRef.current.goTo(1)
    }
  }, [navigationDepthComponentRef.current])

  console.log("Dashboard/index", "BusinessApp?", { isBusinessApp, nestedNavigation })

  // Make sure that remote configs are loaded
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
          <Button className={styles.trigger} shape="circle-outline" size="large" onClick={toggleSiderCollapsed}>
            <Icon type={siderCollapsed ? "menu-unfold" : "menu-fold"} />
          </Button>
        </div>

        <Carousel dots={false} ref={navigationDepthComponentRef}>
          <div>
            <div className={classNames(styles.logo, { [styles.logoCollapsed]: siderCollapsed })}>
              <Typography.Title level={4}>{siderCollapsed ? "OPG" : "ONPOINT"}</Typography.Title>
            </div>
            {nestedNavigation && (
              <div className={classNames(styles.navigationRightArrow, styles.navigationArrow)}>
                <Button ghost onClick={showNestedNavigation}>
                  <Typography.Text>{nestedNavigation.title} Navigation</Typography.Text>
                  <Icon type="arrow-right" />
                </Button>
              </div>
            )}
            <Menu theme="dark" mode="vertical" defaultOpenKeys={activeMenuKeys} selectedKeys={activeMenuKeys}>
              {renderNavEntriesAsMenu(fromStore.navigation || [])}
            </Menu>
          </div>
          {nestedNavigation && (
            <div>
              <div className={classNames(styles.logo, { [styles.logoCollapsed]: siderCollapsed })}>
                <Typography.Title level={4}>
                  {siderCollapsed
                    ? (nestedNavigation.title || "").replace(/[aeiou]+|\s+/gi, "")
                    : nestedNavigation.title}
                </Typography.Title>
              </div>
              <div className={classNames(styles.navigationLeftArrow, styles.navigationArrow)}>
                <Button ghost onClick={showPrimaryNavigation}>
                  <Icon type="arrow-left" />
                  <Typography.Text>Admin Navigation</Typography.Text>
                </Button>
              </div>
              <Menu theme="dark" mode="vertical" defaultOpenKeys={activeMenuKeys} selectedKeys={activeMenuKeys}>
                {renderNavEntriesAsMenu(nestedNavigation.routes || [])}
              </Menu>
            </div>
          )}
        </Carousel>
      </Layout.Sider>

      <Layout>
        <Layout.Header className={`${styles.layoutContainer} ${styles.topToolbar}`}>
          <Row align="middle" type="flex">
            <Col style={{ flex: 1 }}>
              {toArray(props.subroutes).map(([path, subroute]) => (
                <Reach.Match key={subroute.abs} path={`${subroute.path}/*`}>
                  {({ match }) => {
                    if (!match) return
                    return <HeaderTextLayout title={subroute.title} description={subroute.description} />
                  }}
                </Reach.Match>
              ))}
            </Col>
            <Col style={{ flex: 1 }}>
              <Row align="middle" justify="end" type="flex">
                {fromStore.profile
                  .map((profile) => (
                    <Dropdown
                      key={profile.Email}
                      overlay={
                        <Menu
                          onClick={(evt) => {
                            if (evt.key === "logout") {
                              dispatch.iam.logout()
                            } else if (evt.key === "refreshGlobalConfigs") {
                              dispatch.globalConfig.loadRemoteConfigs()
                            }
                          }}>
                          <Menu.Item key="username">
                            <span>{profile.Name}</span>
                          </Menu.Item>
                          <Menu.Item key="email">
                            <Icon type="mail" />
                            <span>
                              <i>{profile.Email}</i>
                            </span>
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item key="refreshGlobalConfigs">
                            <Icon type="sync" />
                            <span>Refresh Global Configs</span>
                          </Menu.Item>
                          <Menu.Item key="logout">
                            <Icon type="logout" />
                            <span>Logout</span>
                          </Menu.Item>
                        </Menu>
                      }
                      placement="bottomCenter"
                      trigger={["click"]}>
                      {profile.ImageUrl ? (
                        <Button shape="circle" htmlType="button">
                          <Avatar src={profile.ImageUrl} alt={profile.Name} />
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
                {guidRegex().exec(parts[idx]) && (
                  <CopyToClipboard text={parts[idx].toLowerCase()} onCopy={() => message.success("Copied!")}>
                    <Button size="small" style={{ margin: "0 5px", opacity: 0.75 }}>
                      <Icon type="copy" />
                    </Button>
                  </CopyToClipboard>
                )}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </Row>

        <Layout.Content className={`${styles.layoutContainer}`} style={{ minHeight: "initial !important" }}>
          <Spin spinning={fromStore.loadingGlobalConfigs}>{props.children}</Spin>
        </Layout.Content>

        <Layout.Footer className={`${styles.layoutContainer}`} style={{ textAlign: "center" }}>
          {`OnPoint Global © ${new Date().getFullYear()}`}
        </Layout.Footer>
      </Layout>
    </Layout>
  )
}

export default Dashboard

const renderNavEntriesAsMenu = (navEntries: (NavigationItem | NavigationGroupWithChildren)[]) =>
  navEntries.map((navEntry) =>
    navEntry.type === "Navigation.Group" ? (
      <Menu.SubMenu
        key={navEntry.id}
        title={
          <span>
            <Icon type={navEntry.icon} />
            <span>{navEntry.name}</span>
          </span>
        }>
        {renderNavEntriesAsMenu(navEntry.children)}
      </Menu.SubMenu>
    ) : (
      <Menu.Item key={navEntry.id}>
        <Icon type={navEntry.icon} />
        <span>{navEntry.name}</span>
        {navEntry.url &&
          (navEntry.url.match(/https?:\/\//) ? (
            <a href={navEntry.url} target="new" />
          ) : (
            <Reach.Link to={navEntry.url} />
          ))}
      </Menu.Item>
    )
  )

const HeaderTextLayout = ({ title, description }: { title: string; description: string }) => (
  <Row align="middle" style={{ display: "flex" }}>
    <Col>
      <Typography.Text strong={true}>{title}</Typography.Text>
    </Col>
    <Space.Vertical width={15} />
    <Col>
      <Typography.Text type="secondary">{description}</Typography.Text>
    </Col>
  </Row>
)
