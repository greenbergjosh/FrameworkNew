import React from "react"
import { Route } from "react-router-dom"
import TextExample from "./text"
import RepeaterExample from "./repeater"
import ContainerExample from "./container"
import TableExample from "./table"
import PivotTableExample from "./pivot-table"
import TreeExample from "./tree"
import ModalExample from "./modal"

export const DisplayRoutes = (props: { path: string }): JSX.Element => {
  const sectionPath = `${props.path}/display`
  return (
    <>
      <Route exact path={`${sectionPath}`}>
        <h2>Display Examples</h2>
      </Route>
      <Route path={`${sectionPath}/text`}>
        <TextExample />
      </Route>
      <Route path={`${sectionPath}/repeater`}>
        <RepeaterExample />
      </Route>
      <Route path={`${sectionPath}/container`}>
        <ContainerExample />
      </Route>
      <Route path={`${sectionPath}/table`}>
        <TableExample />
      </Route>
      <Route path={`${sectionPath}/pivot-table`}>
        <PivotTableExample />
      </Route>
      <Route path={`${sectionPath}/tree`}>
        <TreeExample />
      </Route>
      <Route path={`${sectionPath}/modal`}>
        <ModalExample />
      </Route>
    </>
  )
}
