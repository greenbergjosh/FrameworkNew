import { AppPageConfig, AppPaths, NavigationNode } from "../types"
import { PersistedConfig } from "../../../api/GlobalConfigCodecs"
import { DEFAULT_APP_PAGE_CONFIG } from "../constants"
import { isEmpty } from "lodash/fp"
import { getAppEntityFromPersistedConfig } from "./getAppEntityFromPersistedConfig"

/**
 * Fetches each page config to get missing properties
 * because AppConfig NavigationNodes only have node.id and overridden properties.
 * NavigationNode must have either an id or uri, nothing else is guaranteed
 * @param appPagePersistedConfigs
 * @param navigationNodes
 * @param parentLinkPathSegments
 * @param parent
 * @param appPaths
 */
export function hydrateNavigationNodes({
  navigationNodes,
  appPagePersistedConfigs,
  parentLinkPathSegments = [],
  parent,
  appPaths,
}: {
  navigationNodes: NavigationNode[]
  appPagePersistedConfigs: PersistedConfig[]
  parentLinkPathSegments?: string[]
  parent?: NavigationNode
  appPaths: AppPaths
}): NavigationNode[] {
  if (!navigationNodes) {
    return [{ ...DEFAULT_APP_PAGE_CONFIG, navigation: [] }]
  }
  return navigationNodes.map((node) => {
    const linkPathSegments: string[] = [...parentLinkPathSegments]

    if (isEmpty(node.id)) {
      /*
       * NAVIGATION GROUP
       * Does not have a persistedConfig
       * We must have at least an uri property
       */
      const hydratedNode = {
        ...DEFAULT_APP_PAGE_CONFIG,
        ...node,
        parent,
      }

      /* Populate path */
      const pathSegments = getPathSegments(hydratedNode)
      hydratedNode.path = pathSegments.join("/")

      /* Populate parameters */
      const parameters = getParameters(pathSegments, appPaths.pagePathSegments)
      hydratedNode.parameters = parameters

      /* Populate link path */
      const linkPathSegmentOrNull = getLinkPathSegmentOrNull(hydratedNode.uri, parameters)
      if (linkPathSegmentOrNull) {
        linkPathSegments.push(linkPathSegmentOrNull)
      }
      hydratedNode.link = getLinkPath(linkPathSegments, linkPathSegmentOrNull)

      /* Recurse on child navigation nodes */
      hydratedNode.navigation = !isEmpty(node.navigation)
        ? hydrateNavigationNodes({
            navigationNodes: node.navigation,
            appPagePersistedConfigs,
            parentLinkPathSegments: linkPathSegments,
            parent: hydratedNode,
            appPaths,
          })
        : []
      return hydratedNode
    }

    /*
     * APP PAGE
     * Has a persistedConfig
     * We must have at least an id and uri property
     */
    const appPagePersistedConfig = appPagePersistedConfigs.find((page) => page.id === node.id)
    const appPageConfig =
      appPagePersistedConfig &&
      getAppEntityFromPersistedConfig<AppPageConfig>(appPagePersistedConfig, DEFAULT_APP_PAGE_CONFIG)
    const hydratedNode = {
      ...DEFAULT_APP_PAGE_CONFIG,
      ...appPageConfig,
      ...node,
      parent,
    }

    /* Populate path */
    const pathSegments = getPathSegments(hydratedNode)
    hydratedNode.path = pathSegments.join("/")

    /* Populate parameters */
    const parameters = getParameters(pathSegments, appPaths.pagePathSegments)
    hydratedNode.parameters = parameters

    /* Populate link path */
    const linkPathSegmentOrNull = getLinkPathSegmentOrNull(hydratedNode.uri, parameters)
    if (linkPathSegmentOrNull) {
      linkPathSegments.push(linkPathSegmentOrNull)
    }
    hydratedNode.link = getLinkPath(linkPathSegments, linkPathSegmentOrNull)

    /* Recurse on child navigation nodes */
    hydratedNode.navigation = !isEmpty(node.navigation)
      ? hydrateNavigationNodes({
          navigationNodes: node.navigation,
          appPagePersistedConfigs,
          parentLinkPathSegments: linkPathSegments,
          parent: hydratedNode,
          appPaths,
        })
      : []
    return hydratedNode
  })
}

/**
 *
 */
function getPathSegments(node: NavigationNode, pathSegments: string[] = []): string[] {
  if (!isEmpty(node.uri)) {
    pathSegments.unshift(node.uri)
  }
  if ("parent" in node && node.parent) {
    return getPathSegments(node.parent, pathSegments)
  }
  if (pathSegments.length > 0) {
    return pathSegments
  }
  return ["/"]
}

/**
 *
 */
export function getParameters(
  pathSegments: string[],
  pagePathSegments: AppPaths["pagePathSegments"]
): Record<string, string> {
  return pathSegments.reduce((acc, pathSegment, i) => {
    if (pathSegment.startsWith(":")) {
      const paramName = pathSegment.substring(1)
      acc = { ...acc, [paramName]: pagePathSegments[i] }
    }
    return acc
  }, {})
}

/**
 *
 * @param linkPathSegments
 * @param lastPathSegment
 */
export function getLinkPath(linkPathSegments: string[], lastPathSegment: string | null): string {
  if (
    lastPathSegment &&
    !isEmpty(lastPathSegment) &&
    (lastPathSegment.startsWith("http://") || lastPathSegment.startsWith("https://"))
  ) {
    return lastPathSegment
  }
  return linkPathSegments.join("/")
}

/**
 *
 * @param nodeUri
 * @param parameters
 */
export function getLinkPathSegmentOrNull(nodeUri: string, parameters?: Record<string, string>): string | null {
  if (nodeUri === "*") {
    return null
  }
  if (nodeUri.startsWith(":")) {
    const key = nodeUri.substring(1)
    if (parameters) {
      return parameters[key]
    }
    return null
  }
  return nodeUri
}
