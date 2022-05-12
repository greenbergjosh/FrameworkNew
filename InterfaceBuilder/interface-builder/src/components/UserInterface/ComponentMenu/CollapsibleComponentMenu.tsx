import classNames from "classnames"
import React from "react"
import styles from "../styles.scss"
import { ComponentMenu } from "components/UserInterface/ComponentMenu/ComponentMenu"
import { Icon, Layout, Tooltip, Typography } from "antd"

export function CollapsibleComponentMenu(): JSX.Element {
  const [collapsed, setCollapsed] = React.useState(true)

  const handleClick = (/*e: React.MouseEvent<HTMLElement, MouseEvent>*/): void => {
    setCollapsed(!collapsed)
  }

  return (
    <Layout.Sider
      className={styles.componentMenuPanel}
      collapsed={collapsed}
      collapsedWidth={32}
      collapsible
      onCollapse={setCollapsed}
      trigger={null}
      width={175}>
      {/*
       * Position sticky to make the component menu stay in the viewport.
       */}
      <div style={{ position: "sticky", top: 20 }}>
        <div
          className={classNames(styles.componentMenuToggleBar, collapsed ? styles.collapsed : undefined)}
          onClick={handleClick}>
          <Tooltip title="Drag & Drop Components">
            <Icon type="setting" className={styles.icon} />
          </Tooltip>
          {!collapsed && <Typography.Text className={styles.title}>Drag &amp; Drop Components</Typography.Text>}
        </div>
        {!collapsed && <ComponentMenu />}
      </div>
    </Layout.Sider>
  )
}
