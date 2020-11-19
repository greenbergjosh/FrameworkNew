import { Icon, Layout, Menu } from "antd"
import FormExample from "../examples/form"
import QueryBuilderExample from "../examples/querybuilder"
import RepeaterExample from "../examples/repeater"
import React from "react"
import { Link, Route, Switch, useLocation, useRouteMatch } from "react-router-dom"
import { ExamplesIntroView } from "./ExamplesIntroView"

const SideMenu: React.FC = () => {
  const location = useLocation()

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      defaultOpenKeys={["/examples"]}
      style={{ height: "100%", borderRight: 0 }}>
      <Menu.SubMenu
        key="/examples"
        title={
          <span>
            <Icon type="play-circle" />
            Examples
          </span>
        }>
        <Menu.Item key="/examples/form">
          <Link to="/examples/form">Form</Link>
        </Menu.Item>
        <Menu.Item key="/examples/repeater">
          <Link to="/examples/repeater">Repeater</Link>
        </Menu.Item>
        <Menu.Item key="/examples/querybuilder">
          <Link to="/examples/querybuilder">QueryBuilder</Link>
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  )
}

export function ExamplesView(): JSX.Element {
  const { path, url } = useRouteMatch()

  return (
    <Layout>
      <Layout.Sider width={200} style={{ background: "#fff" }}>
        <SideMenu />
      </Layout.Sider>
      <Layout style={{ padding: "0 24px 24px" }}>
        <Switch>
          <Route exact path={path}>
            <ExamplesIntroView />
          </Route>
          <Route path={`${path}/form`}>
            <FormExample />
          </Route>
          <Route path={`${path}/querybuilder`}>
            <QueryBuilderExample />
          </Route>
          <Route path={`${path}/repeater`}>
            <RepeaterExample />
          </Route>
        </Switch>
      </Layout>
    </Layout>
  )
}
