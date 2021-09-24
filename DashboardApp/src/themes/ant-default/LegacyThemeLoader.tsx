import * as Reach from "@reach/router"
import * as record from "fp-ts/lib/Record"
import React, { Suspense } from "react"
import { flatten } from "fp-ts/lib/Array"
import { None, Some } from "../../data/Option"
import { NotFound } from "../../views/not-found"
import { RouteMeta } from "../../state/navigation"
import { store } from "../../state/store"
import { useRematch } from "../../hooks"
import { LegacyThemeLoaderProps } from "./types"

export function LegacyThemeLoader(props: LegacyThemeLoaderProps): JSX.Element {
  const [fromStore /* , dispatch */] = useRematch((appState) => ({
    profile: appState.iam.profile,
    routes: store.select.navigation.routes(appState),
  }))
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Reach.Router>
        {(function renderRoutes(routes: Record<string, RouteMeta>): Array<JSX.Element> {
          return record.toArray(routes).map(([k, route]) =>
            route.requiresAuthentication === true ? (
              fromStore.profile.foldL(
                None(() => (
                  <Reach.Redirect
                    key={route.abs}
                    from={`${route.abs}/*`}
                    state={{ redirectedFrom: window.location.pathname }}
                    noThrow
                    to={fromStore.routes.login.abs}
                  />
                )),
                Some((prof) => (
                  <route.component key={route.abs} profile={prof} {...route}>
                    {renderRoutes(route.subroutes)}
                  </route.component>
                ))
              )
            ) : (
              <route.component key={route.abs} {...route}>
                {renderRoutes(route.subroutes)}
              </route.component>
            )
          )
        })(fromStore.routes)}

        {(function renderRedirects(routes: Record<string, RouteMeta>): Array<JSX.Element> {
          return flatten(
            record.toArray(routes).map(([k, route]) => {
              return route.redirectFrom
                .map((url) => <Reach.Redirect key={url.concat(route.abs)} noThrow from={url} to={route.abs} />)
                .concat(renderRedirects(route.subroutes))
            })
          )
        })(fromStore.routes)}

        <NotFound default />
      </Reach.Router>
    </Suspense>
  )
}
