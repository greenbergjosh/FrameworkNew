import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { Menu } from "antd"

export const MainMenu: React.FC = () => {
  const location = useLocation()

  console.log("Menu", { location })

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      style={{ lineHeight: "64px" }}
      selectedKeys={[`/${location.pathname.split("/")[1]}`]}>
      <Menu.Item key="/">
        <NavLink to="/">Home</NavLink>
      </Menu.Item>
      <Menu.Item key="/examples">
        <NavLink to="/examples">Examples</NavLink>
      </Menu.Item>
      <Menu.Item key="/quick-start">
        <NavLink to="/quick-start">Quick Start</NavLink>
      </Menu.Item>
      <Menu.Item key="/reference">
        <NavLink to="/reference">Reference</NavLink>
      </Menu.Item>
    </Menu>
  )
}
