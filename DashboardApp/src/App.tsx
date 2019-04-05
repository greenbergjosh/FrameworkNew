import "./App.css"
import * as Reach from "@reach/router"
import React from "react"
import * as ReactRedux from "react-redux"
import { useRematch } from "./hooks/use-rematch"
import { NotFound } from "./routes/not-found"
import { RouteMeta } from "./state/navigation"
import { store } from "./state/store"

export function App(): JSX.Element {
  const [state] = useRematch((s) => ({ paths: s.navigation.routes }))

  return (
    <ReactRedux.Provider store={store}>
      <Reach.Router>
        {(function renderRoutes(routes: Array<RouteMeta<any>>): Array<JSX.Element> {
          return routes.map((route) => (
            <route.component key={route.displayName} path={route.rel} {...route}>
              {renderRoutes(route.subroutes)}
            </route.component>
          ))
        })(state.paths)}
        <NotFound default />
      </Reach.Router>
    </ReactRedux.Provider>
  )
}
