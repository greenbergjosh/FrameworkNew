import * as Reach from "@reach/router"
import { getPersistor } from "@rematch/persist"
import { flatten } from "fp-ts/lib/Array"
import { toArray } from "fp-ts/lib/Record"
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
  ComponentRegistryCache,
  DragDropContext,
  htmlComponents,
  monacoComponents,
  nivoComponents,
  syncfusionComponents,
  registerMonacoEditorMount,
  registry,
} from "@opg/interface-builder"
import { QueryInterfaceComponent } from "./components/custom-ib-components/query/QueryInterfaceComponent"
import { ExecuteInterfaceComponent } from "./components/custom-ib-components/execute/ExecuteInterfaceComponent"
import { PathEditorInterfaceComponent } from "./components/custom-ib-components/path-editor/PathEditorInterfaceComponent"
import { RemoteComponentInterfaceComponent } from "./components/custom-ib-components/remote-component/RemoteComponentInterfaceComponent"
import { SlotConfigInterfaceComponent } from "./components/custom-ib-components/slot-config/SlotConfigInterfaceComponent"
import { getCustomEditorConstructionOptions } from "./components/custom-ib-components/code-editor-mount"
import { SelectInterfaceComponent } from "./components/custom-ib-components/select/SelectInterfaceComponent"
import { TagsInterfaceComponent } from "./components/custom-ib-components/tags/TagsInterfaceComponent"
import { TableInterfaceComponent } from "./components/custom-ib-components/table/TableInterfaceComponent"
import { StringTemplateInterfaceComponent } from "./components/custom-ib-components/string-template/StringTemplateInterfaceComponent"
import { PieInterfaceComponent } from "./components/custom-ib-components/chart/pie/PieInterfaceComponent"
import { LinkInterfaceComponent } from "./components/custom-ib-components/link/LinkInterfaceComponent"
import { withEventManager } from "./components/event-manager/event-manager"
import { RouteMeta } from "./state/navigation"
import { SplashScreen } from "./components/SplashScreen/SplashScreen"

const persistor = getPersistor()

/**
 * Wrap InterfaceBuilder components with the EventManager
 * @param ibComponentLib - An assoc array of InterfaceBuilder components
 */
function wrapLibWithEventManager(ibComponentLib: any) {
  const wrappedComponents: ComponentRegistryCache = {}
  Object.keys(ibComponentLib).forEach((key) => {
    wrappedComponents[key] = withEventManager((ibComponentLib as ComponentRegistryCache)[key])
  })
  return wrappedComponents
}

export function App(): JSX.Element {
  const [fromStore, dispatch] = useRematch((appState) => ({
    profile: appState.iam.profile,
    isCheckingSession: appState.loading.effects.iam.attemptResumeSession,
  }))

  React.useEffect(() => {
    dispatch.iam.attemptResumeSession()
  }, [dispatch.iam])

  React.useEffect(() => {
    registry.register(wrapLibWithEventManager(antComponents))
    registry.register(wrapLibWithEventManager(htmlComponents))
    registry.register(wrapLibWithEventManager(monacoComponents))
    registry.register(wrapLibWithEventManager(nivoComponents))
    registry.register(wrapLibWithEventManager(syncfusionComponents))
    registry.register({ query: withEventManager(QueryInterfaceComponent) })
    registry.register({ execute: withEventManager(ExecuteInterfaceComponent) })
    registry.register({ "path-editor": PathEditorInterfaceComponent })
    registry.register({ "remote-component": RemoteComponentInterfaceComponent })
    registry.register({ "slot-config": withEventManager(SlotConfigInterfaceComponent) })
    registry.register({ "string-template": withEventManager(StringTemplateInterfaceComponent) })
    registry.register({ select: withEventManager(SelectInterfaceComponent) })
    registry.register({ table: withEventManager(TableInterfaceComponent) })
    registry.register({ tags: withEventManager(TagsInterfaceComponent) })
    registry.register({ pie: withEventManager(PieInterfaceComponent) })
    registry.register({ link: withEventManager(LinkInterfaceComponent) })
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
