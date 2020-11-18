import React from "react"
import { Icon, Menu } from "antd"
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"

const { SubMenu } = Menu

const SideMenu: React.FC = () => (
  <Menu
    mode="inline"
    defaultSelectedKeys={["1"]}
    defaultOpenKeys={["sub1"]}
    style={{ height: "100%", borderRight: 0 }}>
    <SubMenu
      key="sub1"
      title={
        <span>
          <Icon type="play-circle" />
          Examples
        </span>
      }>
      <Menu.Item key="1">
        <Link to="/examples/form">Form</Link>
      </Menu.Item>
      <Menu.Item key="2">
        <Link to="/examples/repeater">Repeater (Large)</Link>
      </Menu.Item>
      <Menu.Item key="3">
        <Link to="/examples/querybuilder">QueryBuilder</Link>
      </Menu.Item>
    </SubMenu>
  </Menu>
)

export default SideMenu
