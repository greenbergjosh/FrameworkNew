import React from "react"
import { Icon, Menu } from "antd"

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
      <Menu.Item key="1">Drag-n-Drop</Menu.Item>
    </SubMenu>
  </Menu>
)

export default SideMenu
