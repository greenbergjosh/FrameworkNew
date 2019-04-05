import { head } from "fp-ts/lib/Array"
import { insert, lookup, remove } from "fp-ts/lib/Record"
import * as set from "fp-ts/lib/Set"
import { Config, setoidConfigType } from "../data/GlobalConfig.Config"
import * as Store from "./store.types"

declare module "./store.types" {
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
  configs: Record<Config["id"], Config>
  /** a place to hold edits to a config prior to persisting changes */
  draftConfigs: Record<string, Config>
}

export interface Reducers {
  createDraft(c: Config): void
  rmDraftConfigById(c: Config["id"]): void
  update(payload: Partial<State>): void
  updateConfig(c: Partial<Config> & Required<Pick<Config, "id">>): void
  updateDraftConfig(c: Partial<Config> & Required<Pick<Config, "id">>): void
}

export interface Effects {
  loadAllConfigsMetaOnly(): Promise<void>
  loadConfigById(id: string): Promise<void>
  // createConfig(): Promise<void>
  // updateConfif(): Promise<void>
}

export interface Selectors {
  configsList(state: Store.AppState): Array<Config>
  configTypes(state: Store.AppState): Set<Config["type"]>
}

export const globalConfig: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    configs: {},
    draftConfigs: {},
  },

  reducers: {
    createDraft: (s, c) => ({
      ...s,
      draftConfigs: insert(c.id, c, s.draftConfigs),
    }),
    rmDraftConfigById: (s, id) => ({
      ...s,
      draftConfigs: remove(id, s.draftConfigs),
    }),
    update: (state, payload) => ({ ...state, ...payload }),
    updateConfig: (s, { id, ...updatedFields }) => ({
      ...s,
      configs: lookup(id, s.configs).fold(s.configs, (config) =>
        insert(id, { ...config, ...updatedFields }, s.configs)
      ),
    }),
    updateDraftConfig: (s, { id, ...updatedFields }) => ({
      ...s,
      draftConfigs: lookup(id, s.draftConfigs).fold(s.draftConfigs, (config) =>
        insert(id, { ...config, ...updatedFields }, s.draftConfigs)
      ),
    }),
  },

  effects: (dispatch) => ({
    async loadConfigById(id: string) {
      const response = await dispatch.remoteDataClient.globalConfigsGet({ id })
      return response.fold(
        (httpErr) => dispatch.remoteDataClient.defaultHttpErrorHandler(httpErr),
        (configs) => {
          head(configs).foldL(
            () => dispatch.logger.logInfo(`No config returned for id: ${id}`),
            (config) => dispatch.globalConfig.updateConfig(config)
          )
        }
      )
    },

    async loadAllConfigsMetaOnly() {
      const response = await dispatch.remoteDataClient.globalConfigsGetMetaOnly({})

      return response
        .map((configs) =>
          configs.reduce<Record<string, Config>>((rec, config) => {
            rec[config.id] = config
            return rec
          }, {})
        )
        .fold(
          (httpErr) => dispatch.remoteDataClient.defaultHttpErrorHandler(httpErr),
          (configs) => dispatch.globalConfig.update({ configs })
        )
    },
  }),

  selectors: (slice, createSelector) => ({
    configsList() {
      return createSelector(
        slice((state) => state.configs),
        (configs) => Object.values(configs)
      )
    },

    configTypes({ globalConfig }) {
      return createSelector(
        (state) => globalConfig.configsList(state),
        (configs) => set.fromArray(setoidConfigType)(configs.map((c) => c.type).sort())
      )
    },
  }),
}
