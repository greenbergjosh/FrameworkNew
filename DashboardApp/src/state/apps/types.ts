import { ComponentDefinition } from "@opg/interface-builder"
import * as Store from "../store.types"
import * as GC from "../../data/GlobalConfig.Config"
import { Option } from "fp-ts/lib/Option"

export interface AppEntity {
  id: string
  title: string
  uri: string
  description?: string | null
  icon?: string | null
  disabled: boolean
}

export interface NavigationNode extends AppEntity {
  navigation: NavigationNode[]
  default?: boolean // For View nodes, indicates this is the default view
}

export interface AppConfig extends AppEntity {
  views: NavigationNode[]
  navigation: NavigationNode[]
  defaultTheme?: string
}

export interface AppPageConfig extends AppEntity {
  layout: ComponentDefinition[]
}

export type AppConfigTypes = "App" | "App.Page"

declare module "../store.types" {
  interface AppModels {
    apps: {
      state: State
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

export type AppPaths = {
  rootUri: string
  appUri: string
  pageUri: string
  appRootPath: string
  pagePath: string[]
  currentUrl: string
}

export interface State {
  appPaths: AppPaths
}

export interface Reducers {
  update(payload: Partial<State>): void
}

export interface Effects {
  updateAppPaths(): void
}

export interface Selectors {
  appPersistedConfigs(state: Store.AppState): Option<GC.PersistedConfig[]>
  appPagePersistedConfigs(state: Store.AppState): Option<GC.PersistedConfig[]>
  appConfigs(state: Store.AppState): AppConfig[]
  appPageConfigs(state: Store.AppState): AppPageConfig[]
  appConfig(state: Store.AppState): AppConfig
  appPageConfig(state: Store.AppState): AppPageConfig
  // appPaths(app: Store.AppState): AppPaths
}

export type AppsStoreModel = Store.AppModel<State, Reducers, Effects, Selectors>
