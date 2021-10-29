import classNames from "classnames"
import React from "react"
import styles from "../styles.scss"
import { ComponentMenu } from "./ComponentMenu"
import { EditPanel } from "../../EditPanel/components/EditPanel"
import { Icon, Layout, Tooltip, Typography } from "antd"
import { UILayoutProps } from "components/UserInterface/types"

export function ComponentMenuWrapper(props: UILayoutProps): JSX.Element {
  const [collapsed, setCollapsed] = React.useState(true)

  const handleComponentMenuCollapse = (collapsed: boolean) => {
    setCollapsed(collapsed)
  }

  const handleSiderToggleClick = (/*e: React.MouseEvent<HTMLElement, MouseEvent>*/) => {
    setCollapsed(!collapsed)
  }

  return (
    <Layout className={styles.uiEditor}>
      {!props.hideMenu && (
        <Layout.Sider
          width={175}
          collapsedWidth={32}
          className={styles.componentMenuPanel}
          collapsible
          trigger={null}
          collapsed={collapsed}
          onCollapse={handleComponentMenuCollapse}>
          {/*
           * Position sticky to make the component menu stay in the viewport.
           */}
          <div style={{ position: "sticky", top: 20 }}>
            <div
              className={classNames(styles.componentMenuToggleBar, collapsed ? styles.collapsed : undefined)}
              onClick={handleSiderToggleClick}>
              <Tooltip title="Drag & Drop Components">
                <Icon type="setting" className={styles.icon} />
              </Tooltip>
              {!collapsed && <Typography.Text className={styles.title}>Drag &amp; Drop Components</Typography.Text>}
            </div>
            {!collapsed && <ComponentMenu />}
          </div>
        </Layout.Sider>
      )}
      <Layout.Content className={styles.uiEditorContent}>
        <EditPanel
          title={props.title || "User Interface"}
          style={{ width: "100%" }}
          visibilityMode="user-interface"
          componentDefinition={
            (props.itemToAdd && props.itemToAdd.componentDefinition) ||
            (props.itemToEdit && props.itemToEdit.componentDefinition)
          }>
          {props.children}
        </EditPanel>
      </Layout.Content>
    </Layout>
  )
}
