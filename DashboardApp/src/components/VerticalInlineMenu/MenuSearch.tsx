import React from "react"
import { Button, Input, Tooltip } from "antd"
import { NavigationNode } from "../../state/apps"
import FlexSearch, { Index } from "flexsearch"
import { cloneDeep, isEmpty } from "lodash/fp"

type NavigationNodeMap = Map<string, NavigationNode>

export function MenuSearch({
  appRootPath,
  loading = false,
  menuSearchButtonClass,
  navigationTree,
  setFilteredNavigationTree,
  setOpenKeys,
  setSiderCollapsed,
  siderCollapsed,
}: {
  appRootPath: string
  loading: boolean
  menuSearchButtonClass: string
  navigationTree: NavigationNode[]
  setFilteredNavigationTree: React.Dispatch<React.SetStateAction<NavigationNode[]>>
  setOpenKeys: React.Dispatch<React.SetStateAction<string[] | undefined>>
  setSiderCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  siderCollapsed: boolean
}): JSX.Element {
  /* ***********************************************
   *
   * STATE
   */
  const [searchText, setSearchText] = React.useState("")
  const [hasSearched, setHasSearched] = React.useState(false)

  /* ***********************************************
   *
   * PROP WATCHERS
   */

  /**
   * Make a searchable index from navigationTree
   */
  const { navigationNodeMap, searchDB } = React.useMemo(() => {
    const searchDB: Index<string> = FlexSearch.create({ profile: "speed", tokenize: "full" })
    const navigationNodeMap: NavigationNodeMap = new Map<string, NavigationNode>()

    const addNodeToIndex = (uri: string, node: NavigationNode) => {
      const { title } = node
      // Store the node so we can quickly find it by uri
      navigationNodeMap.set(uri, node)
      // "add()" will accept a string uri but is typed to accept a number, so we up-cast uri as any
      searchDB.add(uri as any, title)
    }

    indexNavigationTree(navigationTree, addNodeToIndex, appRootPath)
    return { navigationNodeMap, searchDB }
  }, [navigationTree, appRootPath])

  /**
   * Filter navigationTree when searchText changes
   */
  React.useEffect(() => {
    if (!isEmpty(searchText)) {
      setHasSearched(true)
      // "search()" is an overloaded method that also returns an array,
      // but TS doesn't see that so we cast the results.
      const searchResultUris = searchDB.search(searchText) as unknown as string[]
      if (isEmpty(searchResultUris)) {
        // User searched, but no results
        setFilteredNavigationTree([])
      } else {
        // User searched and found results
        const mutableOpenKeys: string[] = []
        const filtered = getFilteredNavigationNodes(
          cloneDeep(navigationTree),
          [...searchResultUris],
          setOpenKeys,
          mutableOpenKeys,
          appRootPath
        )
        setOpenKeys(mutableOpenKeys)
        setFilteredNavigationTree(filtered)
      }
    } else if (hasSearched) {
      // No search so load the unfiltered navigationTree
      setOpenKeys([]) // close the menu
      setFilteredNavigationTree(navigationTree)
      setHasSearched(false)
    }
  }, [
    setOpenKeys,
    searchDB,
    setFilteredNavigationTree,
    navigationNodeMap,
    navigationTree,
    searchText,
    hasSearched,
    appRootPath,
  ])

  /* ***********************************************
   *
   * RENDER
   */

  if (siderCollapsed) {
    return (
      <Tooltip title="Find menu items" placement="right" mouseLeaveDelay={0}>
        <Button
          icon="search"
          type="link"
          onClick={() => setSiderCollapsed(false)}
          className={menuSearchButtonClass}
          style={{ marginTop: 16, width: "100%" }}
        />
      </Tooltip>
    )
  }
  return (
    <Input.Search
      autoFocus={true}
      placeholder="Find menu items"
      allowClear={true}
      onChange={(e) => setSearchText(e.currentTarget.value.trim())}
      style={{ padding: 8 }}
      value={searchText}
      disabled={loading}
    />
  )
}

/**
 *
 * @param mutableNavigationNodes
 * @param mutableSearchResultUris
 * @param setOpenKeys
 * @param mutableOpenKeys
 * @param path
 */
function getFilteredNavigationNodes(
  mutableNavigationNodes: NavigationNode[],
  mutableSearchResultUris: string[],
  setOpenKeys: React.Dispatch<React.SetStateAction<string[] | undefined>>,
  mutableOpenKeys: string[],
  path: string
): NavigationNode[] {
  return mutableNavigationNodes.filter((node) => {
    const currentPath = `${path}/${node.link}`

    // Traverse branches
    if (!isEmpty(node.navigation)) {
      node.navigation = getFilteredNavigationNodes(
        node.navigation,
        mutableSearchResultUris,
        setOpenKeys,
        mutableOpenKeys,
        currentPath
      )
      const hasMatchingChildren = !isEmpty(node.navigation)
      if (hasMatchingChildren) {
        mutableOpenKeys.push(currentPath)
      }
      return hasMatchingChildren
    }

    // Leaf node
    const matchedIndex = mutableSearchResultUris.findIndex((uri) => uri === currentPath)
    if (matchedIndex > -1) {
      mutableSearchResultUris.splice(matchedIndex, 1)
      return true
    }
    return false
  })
}

/**
 *
 * @param navigationTree
 * @param addNodeToIndex
 * @param path
 * @param parentNode
 */
function indexNavigationTree(
  navigationTree: NavigationNode[],
  addNodeToIndex: (uri: string, node: NavigationNode) => void,
  path: string,
  parentNode?: NavigationNode
): void {
  navigationTree &&
    navigationTree.forEach((node) => {
      const nextPath = `${path}/${node.link}`
      addNodeToIndex(nextPath, node)
      if (!isEmpty(node.navigation)) {
        indexNavigationTree(node.navigation, addNodeToIndex, nextPath, node)
      }
    })
}
