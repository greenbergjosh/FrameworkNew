import { AppEntity, NavigationNode, NavigationNodeFlatMap } from "../types"
import { isEmpty } from "lodash/fp"
import { getNavigationNodeFlatMaps } from "./getNavigationNodeFlatMaps"

/**
 * Finds an AppEntity from the URI either as a GUID or a snake-case string
 * @param uri
 * @param navigationNodes
 * @param defaultConfig
 */
export function getAppEntityByIdOrUri<T extends AppEntity>(
  navigationNodes: NavigationNode[],
  defaultConfig: T,
  uri?: string
): T {
  if (isEmpty(uri)) {
    return {
      ...defaultConfig,
    } as T
  }

  // TODO: also search by id
  const navigationNodeFlatMaps = getNavigationNodeFlatMaps(navigationNodes)
  const appEntity = getAppEntityFromNavigationNodeFlatMaps(navigationNodeFlatMaps, uri)

  return (
    (appEntity as T) ||
    ({
      ...defaultConfig,
    } as T)
  )
}

/**
 *
 * @param navigationNodeFlatMaps
 * @param uri
 * @param parentNode
 */
function getAppEntityFromNavigationNodeFlatMaps(
  navigationNodeFlatMaps: NavigationNodeFlatMap[],
  uri: string | undefined,
  parentNode?: NavigationNode
): AppEntity | undefined {
  const locSegments = (uri && uri.split("/")) || []
  const navigationNodeFlatMap = navigationNodeFlatMaps.find((nodeFlatMap) => {
    const configSegments = nodeFlatMap.path.split("/") || []

    /*
     * Compare the navigationNode's path to the URL
     */
    let i = 0
    let isMatch = true
    let isPrevWildcard = false
    while (i < locSegments.length && isMatch) {
      const configSegment = configSegments[i] // e.g.:  "reference", "token-reference"
      const locSegment = locSegments[i] // e.g.:  "reference", "token-reference"
      if (configSegment === "*" || isPrevWildcard) {
        /*
         * Wildcard
         */
        isMatch = true
        isPrevWildcard = true
      } else if (configSegment === locSegment) {
        /*
         * Path
         */
        isMatch = true
      } else if (configSegment && configSegment.startsWith(":")) {
        /*
         * Parameter (e.g., ":id")
         */
        isMatch = true
      } else {
        /*
         * No match
         */
        isMatch = false
      }
      i += 1
    }
    return isMatch
  })
  return navigationNodeFlatMap && navigationNodeFlatMap.node
}
