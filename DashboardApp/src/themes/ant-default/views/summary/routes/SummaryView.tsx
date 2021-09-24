import React from "react"
import { Helmet } from "react-helmet"
import { BusinessApplicationPageId } from "../../../components/business-application/types"
import { BusinessApplication } from "../../../components/business-application/BusinessApplication"
import { WithRouteProps } from "../../../../../state/navigation"
import { PageBeacon } from "../../../../../components/PageBeacon"

type BusinessApplicationId = string

interface BusinessApplicationContext {
  id: BusinessApplicationId
}

interface SummaryViewProps {
  context: BusinessApplicationContext
  id: BusinessApplicationId
  pageId: BusinessApplicationPageId
}

export function SummaryView(props: WithRouteProps<SummaryViewProps>): JSX.Element {
  return (
    <>
      <Helmet>
        <title>{props.title || "Summary"} | Channel Admin | OPG</title>
      </Helmet>
      {props["*"] ? (
        props.children
      ) : (
        <BusinessApplication
          applicationId={"f3a34daa-0305-4713-8178-253bbe42f807"}
          pageId={"6d5973cb-605d-406f-9266-e78cc32ac6dc"}
          title={props.title}
        />
      )}
      <PageBeacon
        data={{
          reportId: null,
          appName: "Legacy Site",
          pageTitle: props.title,
        }}
        pageReady={!!props.title && props.title.length > 0}
      />
    </>
  )
}

export default SummaryView
