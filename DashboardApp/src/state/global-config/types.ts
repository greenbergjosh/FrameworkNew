import * as GC from "../../data/GlobalConfig.Config"
import * as Store from "../store.types"
import { NotifyConfig } from "../feedback"
import { RemoteData } from "@devexperts/remote-data-ts"

declare module "../store.types" {
  interface AppModels {
    globalConfig: {
      state: State
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

export interface State {
  /** configs from the database */
  configs: RemoteData<Error, Array<GC.PersistedConfig>>
  readonly defaultEntityTypeConfig: { lang: "json"; nameMaxLength?: number }
  /** a place to hold edits to a config prior to persisting changes */
}

export interface Reducers {
  insertLocalConfig(c: GC.PersistedConfig): void
  rmLocalConfigsById(ids: Array<GC.PersistedConfig["id"]>): void
  update(payload: Partial<State>): void
  updateLocalConfig(c: Partial<GC.PersistedConfig> & Required<Pick<GC.PersistedConfig, "id">>): void
  // insertOrUpdateLocalConfigs(updater: State["configs"]): void
}

export type DeleteConfigEventPayload = {
  prevState: GC.PersistedConfig
  parent?: GC.PersistedConfig
}
export type UpdateConfigEventPayload = {
  prevState: GC.PersistedConfig
  nextState: GC.InProgressRemoteUpdateDraft
  parent?: GC.PersistedConfig
}
export type CreateConfigEventPayload = {
  nextState: GC.InProgressLocalDraftConfig
  parent?: GC.PersistedConfig
}
export type ConfigEventPayload = DeleteConfigEventPayload | UpdateConfigEventPayload | CreateConfigEventPayload

export interface Effects {
  createRemoteConfig(config: CreateConfigEventPayload): Promise<NotifyConfig>
  deleteRemoteConfigs(configs: DeleteConfigEventPayload[]): Promise<NotifyConfig>
  loadRemoteConfigs(): Promise<NotifyConfig>
  updateRemoteConfig(config: UpdateConfigEventPayload): Promise<NotifyConfig>
}

export interface Selectors {
  associations(state: Store.AppState): Record<GC.PersistedConfig["id"], GC.IAssociations>
  /** record of config[] indexed by config.type */
  configsByType(state: Store.AppState): Record<GC.ConfigType, Array<GC.PersistedConfig>>
  /** a record of configs indexed on config.id */
  configsById(state: Store.AppState): Record<GC.PersistedConfig["id"], GC.PersistedConfig>
  configNames(state: Store.AppState): Array<GC.PersistedConfig["name"]>
  /** an array of unique strings which are all the known values on config.type */
  configTypes(state: Store.AppState): Array<GC.ConfigType>
  /** a Record of all configs where config.type === 'EntityType', indexed by config.name
   * which should correspond to some other configs' config.type */
  entityTypeConfigs(state: Store.AppState): Record<GC.ConfigType, GC.PersistedConfig>
}

export type GlobalConfigStoreModel = Store.AppModel<State, Reducers, Effects, Selectors>
