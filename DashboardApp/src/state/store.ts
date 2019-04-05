import storage from "redux-persist/lib/storage"

import Rematch from "@rematch/core"
import createLoadingPlugin from "@rematch/loading"
import createPersistPlugin from "@rematch/persist"
import createSelectPlugin from "@rematch/select"

import { globalConfig } from "./global-config"
// import { entityManager } from "./entity-manager"
import { iam } from "./iam"
import { navigation } from "./navigation"
import { reports } from "./reports"
import * as Store from "./store.types"

const _store = Rematch.init({
  models: ({
    // entityManager,
    globalConfig,
    iam,
    navigation,
    reports,
  } as unknown) as Rematch.Models, // Rematch types are difficult to work with :(
  plugins: [
    createLoadingPlugin(),
    createPersistPlugin({ storage, whitelist: [] }),
    createSelectPlugin(),
  ],
})

// exporting a customized version of the store with better type annotations
export const store = {
  ..._store,
  getState: _store.getState as () => Store.AppState,
  dispatch: _store.dispatch as Store.AppDispatch,
  select: (_store.select as unknown) as Store.AppSelectors,
}
