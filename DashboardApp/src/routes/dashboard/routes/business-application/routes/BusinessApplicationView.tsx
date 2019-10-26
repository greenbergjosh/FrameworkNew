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
  pageId: BusinessApplicationPageId
}
export function BusinessApplicationView(props: WithRouteProps<ViewProps>): JSX.Element {
  return (
    <>
      <Helmet>
        <title>{props.title || "Application Management"} | Channel Admin | OPG</title>
      </Helmet>

      <BusinessApplication
        applicationId={props.context.id}
        pageId={props.pageId}
        title={props.title}
      />
    </>
  )
}
