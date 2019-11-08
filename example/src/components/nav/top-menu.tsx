import React from "react"
import { Menu } from "antd"

const TopMenu: React.FC = () => (
  <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["2"]} style={{ lineHeight: "64px" }}>
    <Menu.Item key="1">Home</Menu.Item>
    <Menu.Item key="2">Examples</Menu.Item>
    <Menu.Item key="3">Guide</Menu.Item>
    <Menu.Item key="4">Docs</Menu.Item>
  </Menu>
)

export default TopMenu
