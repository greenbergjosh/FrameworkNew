import React from "react"
import { ComponentDefinition } from "@opg/interface-builder"
import { DisplayModeProps, RouteRendererProps } from "../types"
import { Router } from "@reach/router"
import { RouteRenderer } from "./RouteRenderer"

// function Foo(props: any) {
//   return <div>FOO? {props.configId}</div>
// }

export function DisplayMode(props: DisplayModeProps): JSX.Element {
  console.log({ Router: props })
  return (
    <div style={{ border: "solid 2px purple" }}>
      <Router>
        {/*<Foo path={"/app/admin/global-configs/fe36eb41-f62e-461a-8ddc-f6b804feb9da"} />*/}
        {(props.components as unknown as RouteRendererProps[]).map((route, index) => (
          <RouteRenderer
            component={route as unknown as ComponentDefinition}
            getRootUserInterfaceData={props.getRootUserInterfaceData}
            key={`route-${index}`}
            mode={props.mode}
            onChangeData={props.onChangeData}
            onChangeRootData={props.onChangeRootData}
            onChangeSchema={props.onChangeSchema}
            path={route.path}
            userInterfaceData={props.userInterfaceData}
          />
        ))}
      </Router>
    </div>
  )
}
