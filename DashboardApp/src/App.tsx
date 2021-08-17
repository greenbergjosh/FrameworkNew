import * as Reach from "@reach/router"
import { getPersistor } from "@rematch/persist"
import React from "react"
import * as ReactRedux from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import styles from "./App.module.scss"
import "./App.scss"
import "@opg/interface-builder/dist/main.css"
import { useRematch } from "./hooks"
import { store } from "./state/store"
import {
  antComponents,
  DragDropContext,
  htmlComponents,
  monacoComponents,
  nivoComponents,
  reachRouterComponents,
  registerMonacoEditorMount,
  registry,
  syncfusionComponents,
} from "@opg/interface-builder"
import { QueryInterfaceComponent } from "./components/custom-ib-components/query/QueryInterfaceComponent"
import { ExecuteInterfaceComponent } from "./components/custom-ib-components/execute/ExecuteInterfaceComponent"
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
import { SplashScreen } from "./components/SplashScreen/SplashScreen"
import { ThemeLoader } from "./themes/ThemeLoader"
import { LegacyThemeLoader } from "./themes/ant-default/LegacyThemeLoader"

const persistor = getPersistor()

export function App(): JSX.Element {
  const [fromStore, dispatch] = useRematch((appState) => ({
    profile: appState.iam.profile,
    isCheckingSession: appState.loading.effects.iam.attemptResumeSession,
    routes: store.select.navigation.routes(appState),
    appConfig: store.select.apps.appConfig(appState),
    appPaths: appState.apps.appPaths,
  }))

  React.useEffect(() => {
    dispatch.iam.attemptResumeSession()
  }, [dispatch.iam])

  React.useEffect(() => {
    registry.register(antComponents)
    registry.register(htmlComponents)
    registry.register(monacoComponents)
    registry.register(nivoComponents)
    registry.register(reachRouterComponents)
    registry.register(syncfusionComponents)
    registry.register({ query: QueryInterfaceComponent })
    registry.register({ execute: ExecuteInterfaceComponent })
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
              <Reach.Router>
                <ThemeLoader path={`/app/*`} />
                <LegacyThemeLoader path={`/*`} />
              </Reach.Router>
            )}
          </DragDropContext.HTML5>
        </ReactRedux.Provider>
      </div>
    </PersistGate>
  )
}
