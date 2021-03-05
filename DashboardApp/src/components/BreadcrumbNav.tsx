import { Breadcrumb } from "antd"
import * as Reach from "@reach/router"
import React from "react"
import { AppConfig, NavigationNode } from "../state/apps"
import { isEmpty } from "lodash/fp"

type Crumb = {
  link: string
  title: string
  isGroup: boolean
}

function BreadcrumbNav(props: {
  appRootPath: string
  appConfig: AppConfig
  currentUri: string
  pagePath?: string
}): JSX.Element | null {
  if (isEmpty(props.appConfig.uri)) return null
  const keys = (props.pagePath && props.pagePath.split("/")) || []
  const mutableCrumbs: Crumb[] = []

  // Add app root crumb
  mutableCrumbs.push({ link: props.appRootPath, title: props.appConfig.title, isGroup: false })
  // Append all the crumnbs
  getCrumbs(props.appRootPath, keys, props.appConfig, mutableCrumbs)

  return (
    <Breadcrumb style={{ fontSize: "0.8em" }} separator=">">
      {mutableCrumbs.map((crumb) => {
        if (crumb.isGroup) {
          return <Breadcrumb.Item key={crumb.link}>{crumb.title}</Breadcrumb.Item>
        }
        return (
          <Breadcrumb.Item key={crumb.link}>
            <Reach.Link to={`/${crumb.link}`}>{crumb.title}</Reach.Link>
          </Breadcrumb.Item>
        )
      })}
    </Breadcrumb>
  )
}

export default React.memo(BreadcrumbNav)

function getCrumbs(path: string, keys: string[], navigationNode: NavigationNode, mutableCrumbs: Crumb[]) {
  const key = keys.shift()
  const crumb = navigationNode.navigation.find((n) => n.uri === key)
  if (crumb) {
    const nextPath = `${path}/${crumb.uri}`
    const isGroup = isEmpty(crumb.id)
    mutableCrumbs.push({ link: nextPath, title: crumb.title, isGroup })
    if (!isEmpty(crumb.navigation)) {
      getCrumbs(nextPath, keys, crumb, mutableCrumbs)
    }
  }
}
