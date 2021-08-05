import { NavigationNode, NavigationNodeFlatMap } from "../types"
import { isEmpty } from "lodash/fp"

/**
 * Convert a AppEntity navigation tree into a path keyed hash map to the AppEntities
 * @param navigationNodes
 * @param parentPathSegments
 * @param parentNode
 */
export function getNavigationNodeFlatMaps(
  navigationNodes: NavigationNode[],
  parentPathSegments: string[] = [],
  parentNode?: NavigationNode
): NavigationNodeFlatMap[] {
  let navigationNodeFlatMaps: NavigationNodeFlatMap[] = []
  let i = 0
  while (i < navigationNodes.length) {
    const pathSegments: string[] = [...parentPathSegments]
    const node: NavigationNode = { ...navigationNodes[i], parent: parentNode }
    pathSegments.push(node.uri)
    const path = pathSegments.join("/")

    navigationNodeFlatMaps.push({
      path,
      node,
    })

    /*
     * Recurse on navigation collection
     */
    if (!isEmpty(node.navigation)) {
      const flatChildren = getNavigationNodeFlatMaps(node.navigation, pathSegments, node)
      navigationNodeFlatMaps = navigationNodeFlatMaps.concat(flatChildren)
    }
    i += 1
  }
  return navigationNodeFlatMaps
}
