import { ComponentDefinition } from "@opg/interface-builder"
import * as Store from "../store.types"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { NotifyConfig } from "../feedback"
import { RemoteData } from "@devexperts/remote-data-ts"

export interface AppEntity {
  id: string
  title: string
  shortTitle?: string
  uri: string
  link: string
  path?: string
  parameters: Record<string, string>
  description?: string | null
  icon?: string | null
  disabled: boolean
}

export interface NavigationNode extends AppEntity {
  navigation: NavigationNode[]
  default?: boolean // For View nodes, indicates this is the default view
  parent?: NavigationNode
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

/**
 * A model exposed to the page's props.userInterfaceData
 */
export interface AppPageModel {
  $app: {
    location: {
      parameters: Record<string, string>
    }
  }
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
  pagePathSegments: string[]
  currentUrl: string
}

export interface State {
  appPaths: AppPaths
  configs: RemoteData<Error, Array<PersistedConfig>>
}

export interface Reducers {
  update(payload: Partial<State>): void
  updateAppConfigs(payload: Partial<State>): void
}

export interface Effects {
  updateAppPaths(): void
  loadAppConfigs(): Promise<NotifyConfig>
}

export interface Selectors {
  appPagePersistedConfigs(state: Store.AppState): PersistedConfig[]
  appPagePersistedConfigsOLD(state: Store.AppState): PersistedConfig[]
  appConfigs(state: Store.AppState): AppConfig[]
  appConfigsOLD(state: Store.AppState): AppConfig[]
  appConfig(state: Store.AppState): AppConfig
  appPageConfig(state: Store.AppState): AppPageConfig
  appPageModel(state: Store.AppState): AppPageModel
}

export type AppsStoreModel = Store.AppModel<State, Reducers, Effects, Selectors>

/**
 * path is a full relative URL path to this resource
 */
export type NavigationNodeFlatMap = { path: string; node: NavigationNode }
