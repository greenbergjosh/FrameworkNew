import { ComponentDefinition } from "@opg/interface-builder"
import * as Store from "../store.types"
import { PersistedConfig } from "../../data/GlobalConfig.Config"

export interface AppEntity {
  id: string
  title: string
  shortTitle?: string
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
  notFoundPageId?: string
  defaultTheme?: string
}

export interface AppPageConfig extends AppEntity {
  layout: ComponentDefinition[]
}

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
  appUri?: string
  pageUri?: string
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
  appPagePersistedConfigs(state: Store.AppState): PersistedConfig[]
  appConfigs(state: Store.AppState): AppConfig[]
  appConfig(state: Store.AppState): AppConfig
  appPageConfig(state: Store.AppState): AppPageConfig
}

export type AppsStoreModel = Store.AppModel<State, Reducers, Effects, Selectors>
