import { Route } from "react-router-dom"
import DataBindingExample from "./data-binding"
import TextTokensExample from "./text-tokens"
import FormattersExample from "./text-tokens"
import React from "react"

export const FrameworkRoutes = (props: { path: string }): JSX.Element => {
  const sectionPath = `${props.path}/framework`
  return (
    <>
      <Route exact path={`${sectionPath}`}>
        <h2>Framework Examples</h2>
      </Route>
      <Route path={`${sectionPath}/data-binding`}>
        <DataBindingExample />
      </Route>
      <Route path={`${sectionPath}/text-tokens`}>
        <TextTokensExample />
      </Route>
      <Route path={`${sectionPath}/formatters`}>
        <FormattersExample />
      </Route>
    </>
  )
}
