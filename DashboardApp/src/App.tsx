import * as Reach from "@reach/router"
import { getPersistor } from "@rematch/persist"
import { flatten } from "fp-ts/lib/Array"
import { toArray } from "fp-ts/lib/Record"
import React from "react"
import * as ReactRedux from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import styles from "./App.module.css"
import "./App.scss"
import { None, Some } from "./data/Option"
import { useRematch } from "./hooks/use-rematch"
import { NotFound } from "./routes/not-found"
import { RouteMeta } from "./state/navigation"
import { store } from "./state/store"

const persistor = getPersistor()

export function App(): JSX.Element {
  const [fromStore, dispatch] = useRematch((s) => ({
    profile: s.iam.profile,
    routes: store.select.navigation.routes(s),
  }))

  React.useEffect(() => {
    dispatch.iam.attemptResumeSession()
  }, [dispatch.iam])

  return (
    <PersistGate persistor={persistor}>
      <div className={`${styles.app}`}>
        <ReactRedux.Provider store={store}>
          <Reach.Router>
            {(function renderRoutes(routes: Record<string, RouteMeta>): Array<JSX.Element> {
              return toArray(routes).map(([k, route]) =>
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
                toArray(routes).map(([k, route]) => {
                  return route.redirectFrom
                    .map((url) => (
                      <Reach.Redirect
                        key={url.concat(route.abs)}
                        noThrow
                        from={url}
                        to={route.abs}
                      />
                    ))
                    .concat(renderRedirects(route.subroutes))
                })
              )
            })(fromStore.routes)}

            <NotFound default />
          </Reach.Router>
        </ReactRedux.Provider>
      </div>
    </PersistGate>
  )
}

// function Route<P>(props: React.PropsWithChildren<P>): JSX.Element {
//   return <FadeTransitionRouter>{props.children}</FadeTransitionRouter>
// }

// const FadeTransitionRouter = (props: React.PropsWithChildren<{}>) => (
//   <Reach.Location>
//     {({ location }) => (
//       <TransitionGroup className="transition-group">
//         <CSSTransition key={location.key} classNames="fade" timeout={500}>
//           {/* the only difference between a router animation and
//               any other animation is that you have to pass the
//               location to the router so the old screen renders
//               the "old location" */}
//           <Reach.Router location={location} className="router">
//             {props.children}
//           </Reach.Router>
//         </CSSTransition>
//       </TransitionGroup>
//     )}
//   </Reach.Location>
// )
