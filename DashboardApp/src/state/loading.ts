/**
 * This model is provided by the @rematch/loading plugin,
 * which provides a loading model that maintains boolean flags for
 * each model and for each model's effects, allowing any part of the
 * application to easily observe what models or effects are currently
 * awaiting some asynchronous task.
 *
 * This file just provides type annotations for the loading model,
 * not implementation
 */

import * as Store from "./store.types"

declare module "./store.types" {
  interface AppModels {
    loading: {
      state: { effects: EffsLoading; models: ModelsLoading }
      reducers: {}
      effects: {}
      selectors: {}
    }
  }
}

export type EffsLoading = {
  [K in keyof Store.AppEffects]: { [KK in keyof Store.AppEffects[K]]: boolean }
}

export type ModelsLoading = { [K in keyof Store.AppModels]: boolean }
