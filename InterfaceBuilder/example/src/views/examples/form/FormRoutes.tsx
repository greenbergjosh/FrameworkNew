import { Route } from "react-router-dom"
import ButtonExample from "./button"
import QueryBuilderExample from "./querybuilder"
import DateStepperExample from "./date-stepper"
import RadioExample from "./radio"
import NumberExample from "./number"
import NumberRangeExample from "./number-range"
import StringTemplateExample from "./string-template"
import DateRangeExample from "./date-range"
import React from "react"

export const FormRoutes = (props: { path: string }): JSX.Element => {
  console.log("FormRoutes", props)
  const sectionPath = `${props.path}/form`
  return (
    <>
      <Route exact path={sectionPath}>
        <h2>Form Examples</h2>
      </Route>
      <Route path={`${sectionPath}/button`}>
        <ButtonExample />
      </Route>
      <Route path={`${sectionPath}/querybuilder`}>
        <QueryBuilderExample />
      </Route>
      <Route path={`${sectionPath}/date-stepper`}>
        <DateStepperExample />
      </Route>
      <Route path={`${sectionPath}/radio`}>
        <RadioExample />
      </Route>
      <Route path={`${sectionPath}/number`}>
        <NumberExample />
      </Route>
      <Route path={`${sectionPath}/number-range`}>
        <NumberRangeExample />
      </Route>
      <Route path={`${sectionPath}/string-template`}>
        <StringTemplateExample />
      </Route>
      <Route path={`${sectionPath}/date-range`}>
        <DateRangeExample />
      </Route>
    </>
  )
}
