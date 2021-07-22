import * as Reach from "@reach/router"
import { getPersistor } from "@rematch/persist"
import { flatten } from "fp-ts/lib/Array"
import * as record from "fp-ts/lib/Record"
import React from "react"
import * as ReactRedux from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import styles from "./App.module.scss"
import "./App.scss"
import "@opg/interface-builder/dist/main.css"
import { None, Some } from "./data/Option"
import { useRematch } from "./hooks"
import { NotFound } from "./views/not-found"
import { store } from "./state/store"
import {
  antComponents,
  DragDropContext,
  htmlComponents,
  monacoComponents,
  nivoComponents,
  registerMonacoEditorMount,
  registry,
  syncfusionComponents,
} from "@opg/interface-builder"
import { QueryInterfaceComponent } from "./components/custom-ib-components/query/QueryInterfaceComponent"
import { ExecuteInterfaceComponent } from "./components/custom-ib-components/execute/ExecuteInterfaceComponent"
import { PathEditorInterfaceComponent } from "./components/custom-ib-components/path-editor/PathEditorInterfaceComponent"
import { RelationshipsInterfaceComponent } from "./components/custom-ib-components/relationships/RelationshipsInterfaceComponent"
import { RemoteComponentInterfaceComponent } from "./components/custom-ib-components/remote-component/RemoteComponentInterfaceComponent"
import { SlotConfigInterfaceComponent } from "./components/custom-ib-components/slot-config/SlotConfigInterfaceComponent"
import { getCustomEditorConstructionOptions } from "./components/custom-ib-components/code-editor-mount"
import { SelectInterfaceComponent } from "./components/custom-ib-components/select/SelectInterfaceComponent"
import { TagsInterfaceComponent } from "./components/custom-ib-components/tags/TagsInterfaceComponent"
import { TableInterfaceComponent } from "./components/custom-ib-components/table/TableInterfaceComponent"
import { StringTemplateInterfaceComponent } from "./components/custom-ib-components/string-template/StringTemplateInterfaceComponent"
import { PieInterfaceComponent } from "./components/custom-ib-components/pie/PieInterfaceComponent"
import { LinkInterfaceComponent } from "./components/custom-ib-components/link/LinkInterfaceComponent"
import { RouteMeta } from "./state/navigation"
import { SplashScreen } from "./components/SplashScreen/SplashScreen"

const persistor = getPersistor()

export function App(): JSX.Element {
  const [fromStore, dispatch] = useRematch((appState) => ({
    profile: appState.iam.profile,
    isCheckingSession: appState.loading.effects.iam.attemptResumeSession,
  }))

  React.useEffect(() => {
    dispatch.iam.attemptResumeSession()
  }, [dispatch.iam])

  React.useEffect(() => {
    registry.register(antComponents)
    registry.register(htmlComponents)
    registry.register(monacoComponents)
    registry.register(nivoComponents)
    registry.register(syncfusionComponents)
    registry.register({ query: QueryInterfaceComponent })
    registry.register({ execute: ExecuteInterfaceComponent })
    registry.register({ "path-editor": PathEditorInterfaceComponent })
    registry.register({ relationships: RelationshipsInterfaceComponent })
    registry.register({ "remote-component": RemoteComponentInterfaceComponent })
    registry.register({ "slot-config": SlotConfigInterfaceComponent })
    registry.register({ "string-template": StringTemplateInterfaceComponent })
    registry.register({ select: SelectInterfaceComponent })
    registry.register({ table: TableInterfaceComponent })
    registry.register({ tags: TagsInterfaceComponent })
    registry.register({ pie: PieInterfaceComponent })
    registry.register({ link: LinkInterfaceComponent })
    registerMonacoEditorMount(getCustomEditorConstructionOptions)
  }, [])

  return (
    <PersistGate persistor={persistor} loading={<SplashScreen title="Restoring Application State..." />}>
      <div className={`${styles.app}`}>
        <ReactRedux.Provider store={store}>
          <DragDropContext.HTML5>
            {fromStore.isCheckingSession && fromStore.profile.isNone() ? (
              <SplashScreen title="Checking Session Authentication..." />
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
  const [fromStore /* , dispatch */] = useRematch((appState) => ({
    profile: appState.iam.profile,
    routes: store.select.navigation.routes(appState),
  }))
  return (
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
  )
}
