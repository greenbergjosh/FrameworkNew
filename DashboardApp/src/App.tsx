import "./App.css"
import React from "react"
import * as Reach from "@reach/router"
import { useRematch } from "./hooks/use-rematch"
import { store } from "./state/store"
import { RouteMeta } from "./state/navigation"
import { NotFound } from "./routes/not-found"

export function App(): JSX.Element {
  const [state] = useRematch(store, (s) => ({ paths: s.navigation.routes }))

  return (
    <Reach.Router>
      {(function renderRoutes(routes: Array<RouteMeta>): Array<JSX.Element> {
        return routes.map((route) => (
          <route.component key={route.displayName} path={route.rel} {...route}>
            {renderRoutes(route.subroutes)}
          </route.component>
        ))
      })(state.paths)}
      <NotFound default />
    </Reach.Router>
  )
}
