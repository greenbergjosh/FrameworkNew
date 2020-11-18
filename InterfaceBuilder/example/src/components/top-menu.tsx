import React from "react"
import { Menu } from "antd"
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"

const TopMenu: React.FC = () => (
  <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["2"]} style={{ lineHeight: "64px" }}>
    <Menu.Item key="1">
      <Link to="/">Home</Link>
    </Menu.Item>
    <Menu.Item key="2">
      <Link to="/examples">Examples</Link>
    </Menu.Item>
    <Menu.Item key="4">
      <Link to="/quick-start">Quick Start</Link>
    </Menu.Item>
    <Menu.Item key="3">
      <Link to="/reference">Reference</Link>
    </Menu.Item>
  </Menu>
)

export default TopMenu
