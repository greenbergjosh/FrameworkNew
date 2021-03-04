import { Icon, Menu as AntMenu } from "antd"
import React from "react"
import * as Reach from "@reach/router"
import { NavigationNode } from "../../state/apps"
import { isEmpty, isUndefined } from "lodash/fp"

function Menu(props: {
  appRootPath: string
  className?: string
  navigationTree: NavigationNode[]
  openKeys?: string[]
  selectedKeys?: string[]
  setOpenKeys: React.Dispatch<React.SetStateAction<string[] | undefined>>
  setSelectedKeys: React.Dispatch<React.SetStateAction<string[] | undefined>>
}): JSX.Element {
  const { openKeys, setOpenKeys, selectedKeys, setSelectedKeys } = props
  /**
   * Allow user to collapse menu groups after they have been opened programmatically.
   * Otherwise, the menu will not respond to the user opening and closing menu groups.
   */
  React.useEffect(() => {
    if (!isUndefined(openKeys)) setOpenKeys(undefined)
    if (!isUndefined(selectedKeys)) setSelectedKeys(undefined)
  }, [openKeys, setOpenKeys, selectedKeys, setSelectedKeys])

  return (
    <AntMenu
      mode="inline" // vertical menu with "inline" submenus
      // Add selecteKeys and openKeys props only when they are defined, otherwise they will
      // make the menu unable to be opened, selected and closed by the user.
      {...(selectedKeys ? { selectedKeys } : undefined)}
      {...(openKeys ? { openKeys } : undefined)}
      className={props.className}>
      {getMenuItems(props.navigationTree || [], props.appRootPath)}
    </AntMenu>
  )
}

export default React.memo(Menu)

/**
 * Recursively build menu tree
 * @param navigationTree
 * @param path
 */
function getMenuItems(navigationTree: NavigationNode[], path: string): JSX.Element[] | null {
  if (isEmpty(navigationTree)) return null

  return navigationTree.map((node) => {
    const currentPath = `${path}/${node.uri}`
    const title = !isEmpty(node.shortTitle) ? node.shortTitle : node.title

    if (isEmpty(node.navigation)) {
      return (
        <AntMenu.Item key={currentPath}>
          {node.uri &&
            (node.uri.match(/https?:\/\//) ? (
              <a href={node.uri} target={node.uri.match(/.*techopg\.com.*/) ? "" : "new"}>
                {node.icon && <Icon type={node.icon} />}
                <>{title}</>
              </a>
            ) : (
              <Reach.Link to={`/${currentPath}`}>
                {node.icon && <Icon type={node.icon} />}
                <>{title}</>
              </Reach.Link>
            ))}
        </AntMenu.Item>
      )
    }
    return (
      <AntMenu.SubMenu
        key={currentPath}
        title={
          <>
            {node.icon && <Icon type={node.icon} />}
            {title}
            {node.id && (
              <Reach.Link to={`/${currentPath}`}>
                <Icon type="link" style={{ marginLeft: 5 }} />
              </Reach.Link>
            )}
          </>
        }>
        {getMenuItems(node.navigation, currentPath)}
      </AntMenu.SubMenu>
    )
  })
}
