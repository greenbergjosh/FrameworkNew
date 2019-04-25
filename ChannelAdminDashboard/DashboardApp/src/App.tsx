import * as Reach from "@reach/router"
import { flatten } from "fp-ts/lib/Array"
import { toArray } from "fp-ts/lib/Record"
import React from "react"
import * as ReactRedux from "react-redux"
import "./App.scss"
import { useRematch } from "./hooks/use-rematch"
import { NotFound } from "./routes/not-found"
import { RouteMeta } from "./state/navigation"
import { store } from "./state/store"

export function App(): JSX.Element {
  const [state] = useRematch((s) => ({
    routes: store.select.navigation.routes(s),
  }))

  const routes = React.useMemo(() => renderRoutes(state.routes), [state.routes])
  const redirects = React.useMemo(() => renderRedirects(state.routes), [state.routes])

  return (
    <ReactRedux.Provider store={store}>
      <Reach.Router>
        {routes}
        {redirects}
        <NotFound default />
      </Reach.Router>
    </ReactRedux.Provider>
  )
}

function renderRoutes(routes: Record<string, RouteMeta>): Array<JSX.Element> {
  return toArray(routes).map(([k, route]) => (
    <route.component key={route.abs} {...route}>
      {renderRoutes(route.subroutes)}
    </route.component>
  ))
}

function renderRedirects(routes: Record<string, RouteMeta>): Array<JSX.Element> {
  return flatten(
    toArray(routes).map(([k, route]) => {
      return route.redirectFrom
        .map((url) => (
          <Reach.Redirect key={url.concat(route.abs)} from={url} noThrow={true} to={route.abs} />
        ))
        .concat(renderRedirects(route.subroutes))
    })
  )
}
