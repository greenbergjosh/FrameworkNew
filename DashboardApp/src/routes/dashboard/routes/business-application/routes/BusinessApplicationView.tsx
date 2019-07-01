import React from "react"
import Helmet from "react-helmet"
import { BusinessApplication } from "../../../../../components/business-application/BusinessApplication"
import { WithRouteProps } from "../../../../../state/navigation"

type BusinessApplicationId = string

interface BusinessApplicationContext {
  id: BusinessApplicationId
}

interface ViewProps {
  context: BusinessApplicationContext
}
export function BusinessApplicationView(props: WithRouteProps<ViewProps>): JSX.Element {
  return (
    <>
      <Helmet>
        <title>{props.title || "Application Management"} | Channel Admin | OPG</title>
      </Helmet>

      <BusinessApplication applicationId={props.context.id} title={props.title} />
    </>
  )
}
