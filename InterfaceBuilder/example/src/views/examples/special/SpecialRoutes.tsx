import { Route } from "react-router-dom"
import DataInjectorExample from "./data-injector"
import React from "react"

export const SpecialRoutes = (props: { path: string }): JSX.Element => {
  const sectionPath = `${props.path}/special`
  return (
    <>
      <Route exact path={`${sectionPath}`}>
        <h2>Special Examples</h2>
      </Route>
      <Route path={`${sectionPath}/data-injector`}>
        <DataInjectorExample />
      </Route>
    </>
  )
}
