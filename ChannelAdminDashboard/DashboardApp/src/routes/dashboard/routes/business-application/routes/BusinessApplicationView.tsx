import { Divider } from "antd"
import React from "react"
import Helmet from "react-helmet"
import { BusinessApplicationPageId } from "../../../../../components/business-application/business-application.types"
import { BusinessApplication } from "../../../../../components/business-application/BusinessApplication"
import { WithRouteProps } from "../../../../../state/navigation"

type BusinessApplicationId = string

interface BusinessApplicationContext {
  id: BusinessApplicationId
}

interface ViewProps {
  context: BusinessApplicationContext
  id: BusinessApplicationId
  pageId: BusinessApplicationPageId
}
export function BusinessApplicationView(props: WithRouteProps<ViewProps>): JSX.Element {
  return (
    <>
      <Helmet>
        <title>{props.title || "Application Management"} | Channel Admin | OPG</title>
      </Helmet>
      {props["*"] ? (
        props.children
      ) : (
        <BusinessApplication applicationId={props.id} pageId={props.pageId} title={props.title} />
      )}
    </>
  )
}
