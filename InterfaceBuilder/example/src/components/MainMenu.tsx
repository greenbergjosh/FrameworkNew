import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { Icon, Menu } from "antd"

export const MainMenu: React.FC = () => {
  const location = useLocation()

  console.log("Menu", { location })

  return (
    <>
      <div style={{ display: "inline-block", color: "grey", marginRight: 50 }}>
        <NavLink to="/">
          <Icon type="setting" /> InterfaceBuilder
        </NavLink>
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        style={{ lineHeight: "64px", display: "inline-block" }}
        selectedKeys={[`/${location.pathname.split("/")[1]}`]}>
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
    </>
  )
}
