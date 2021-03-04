import React from "react"
import { MenuSearch } from "./MenuSearch"
import Menu from "./Menu"
import { AppConfig, NavigationNode } from "../../state/apps"
import { isEmpty, isUndefined } from "lodash/fp"

export function VerticalInlineMenu(props: {
  appRootPath: string
  appUri: string
  collapsed: boolean
  menuSearchButtonClass: string
  navigationTree: AppConfig["navigation"]
  pagePath?: string
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  menuClassName?: string
}): JSX.Element {
  const [filteredNavigationTree, setFilteredNavigationTree] = React.useState<NavigationNode[]>([])
  const [selectedKeys, setSelectedKeys] = React.useState<string[] | undefined>()
  const [openKeys, setOpenKeys] = React.useState<string[] | undefined>()
  const prevAppUri = React.useRef<string | null>(null)

  /**
   * Copy navigationTree from props into state so we can change it.
   */
  React.useEffect(() => {
    // Either appUri was not previously loaded, or the user has changed apps
    if (prevAppUri.current !== props.appUri) {
      setFilteredNavigationTree(props.navigationTree)
      prevAppUri.current = props.appUri
    }
  }, [props.navigationTree, props.appUri])

  /**
   * Set the current page opened in the menu
   */
  React.useEffect(() => {
    const pathKeys = props.pagePath && props.pagePath.split("/")
    const keysToOpen: string[] = []

    pathKeys &&
      pathKeys.forEach((key) => {
        keysToOpen.push(`${props.appRootPath}/${key}`)
        return [...keysToOpen]
      })
    // The last key is a page not a nav group.
    // Since it can't be opened we remove it
    keysToOpen.pop()

    props.pagePath && setOpenKeys(keysToOpen)
    props.pagePath && setSelectedKeys([`${props.appRootPath}/${props.pagePath}`])
  }, [props.pagePath, props.appRootPath])

  return (
    <>
      {isEmpty(props.navigationTree) ? null : (
        <MenuSearch
          appRootPath={props.appRootPath}
          loading={isUndefined(filteredNavigationTree)}
          menuSearchButtonClass={props.menuSearchButtonClass}
          navigationTree={props.navigationTree}
          setFilteredNavigationTree={setFilteredNavigationTree}
          setOpenKeys={setOpenKeys}
          setSiderCollapsed={props.setCollapsed}
          siderCollapsed={props.collapsed}
        />
      )}
      {props.collapsed ? null : (
        <Menu
          appRootPath={props.appRootPath}
          className={props.menuClassName}
          navigationTree={filteredNavigationTree}
          openKeys={openKeys}
          selectedKeys={selectedKeys}
          setOpenKeys={setOpenKeys}
          setSelectedKeys={setSelectedKeys}
        />
      )}
    </>
  )
}
