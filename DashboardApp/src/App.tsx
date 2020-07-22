import * as Reach from "@reach/router"
import { getPersistor } from "@rematch/persist"
import { Spin } from "antd"
import { flatten } from "fp-ts/lib/Array"
import { toArray } from "fp-ts/lib/Record"
import React from "react"
import { Helmet } from "react-helmet"
import * as ReactRedux from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import styles from "./App.module.css"
import "./App.scss"
import "@opg/interface-builder/dist/main.css"
import { None, Some } from "./data/Option"
import { useRematch } from "./hooks/use-rematch"
import { NotFound } from "./routes/not-found"
import { RouteMeta } from "./state/navigation"
import { store } from "./state/store"
import { antComponents, DragDropContext, registerMonacoEditorMount, registry } from "@opg/interface-builder"
import { QueryInterfaceComponent } from "./components/custom-ib-components/query/QueryInterfaceComponent"
import { ExecuteInterfaceComponent } from "./components/custom-ib-components/execute/ExecuteInterfaceComponent"
import { PathEditorInterfaceComponent } from "./components/custom-ib-components/path-editor/PathEditorInterfaceComponent"
import { RemoteComponentInterfaceComponent } from "./components/custom-ib-components/remote-component/RemoteComponentInterfaceComponent"
import { SlotConfigInterfaceComponent } from "./components/custom-ib-components/slot-config/SlotConfigInterfaceComponent"
import { getCustomEditorConstructionOptions } from "./components/custom-ib-components/code-editor-mount"
import { SelectInterfaceComponent } from "./components/custom-ib-components/select/SelectInterfaceComponent"
import { TagsInterfaceComponent } from "./components/custom-ib-components/tags/TagsInterfaceComponent"
import { StringTemplateInterfaceComponent } from "./components/custom-ib-components/string-template/StringTemplateInterfaceComponent"

const persistor = getPersistor()

interface AppLoadingScreenProps {
  title?: string
}

function AppLoadingScreen({ title }: AppLoadingScreenProps) {
  return (
    <>
      <Helmet>
        <title>Loading... | Channel Admin | OPG</title>
      </Helmet>

      <div className={`${styles.appLoadingIndicator}`}>
        <Spin size="large" tip={`Initializing OnPoint Admin${title ? `... ${title}` : ""}`} />
      </div>
    </>
  )
}

export function App(): JSX.Element {
  const [fromStore, dispatch] = useRematch((s) => ({
    profile: s.iam.profile,
    isCheckingSession: s.loading.effects.iam.attemptResumeSession,
  }))

  React.useEffect(() => {
    dispatch.iam.attemptResumeSession()
  }, [dispatch.iam])

  React.useEffect(() => {
    registry.register(antComponents)
    registry.register({ query: QueryInterfaceComponent })
    registry.register({ execute: ExecuteInterfaceComponent })
    registry.register({ "path-editor": PathEditorInterfaceComponent })
    registry.register({ "remote-component": RemoteComponentInterfaceComponent })
    registry.register({ "slot-config": SlotConfigInterfaceComponent })
    registry.register({ "string-template": StringTemplateInterfaceComponent })
    registry.register({ select: SelectInterfaceComponent })
    registry.register({ tags: TagsInterfaceComponent })
    registerMonacoEditorMount(getCustomEditorConstructionOptions)
  }, [])

  return (
    <PersistGate persistor={persistor} loading={<AppLoadingScreen title="Restoring Application State" />}>
      <div className={`${styles.app}`}>
        <ReactRedux.Provider store={store}>
          <DragDropContext.HTML5>
            {fromStore.isCheckingSession && fromStore.profile.isNone() ? (
              <AppLoadingScreen title="Checking Session Authentication" />
            ) : (
              <Routes />
            )}
          </DragDropContext.HTML5>
        </ReactRedux.Provider>
      </div>
    </PersistGate>
  )
}

function Routes() {
  const [fromStore, dispatch] = useRematch((s) => ({
    profile: s.iam.profile,
    routes: store.select.navigation.routes(s),
  }))
  return (
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
              .map((url) => <Reach.Redirect key={url.concat(route.abs)} noThrow from={url} to={route.abs} />)
              .concat(renderRedirects(route.subroutes))
          })
        )
      })(fromStore.routes)}

      <NotFound default />
    </Reach.Router>
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
