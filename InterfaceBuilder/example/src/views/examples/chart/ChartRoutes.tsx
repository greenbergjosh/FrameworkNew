import { Route } from "react-router-dom"
import LineChartExample from "./line-chart"
import PieExample from "./pie"
import React from "react"

export const ChartRoutes = (props: { path: string }): JSX.Element => {
  const sectionPath = `${props.path}/chart`
  return (
    <>
      <Route exact path={sectionPath}>
        <h2>Chart Examples</h2>
      </Route>
      <Route path={`${sectionPath}/line-chart`}>
        <LineChartExample />
      </Route>
      <Route path={`${sectionPath}/pie`}>
        <PieExample />
      </Route>
    </>
  )
}
