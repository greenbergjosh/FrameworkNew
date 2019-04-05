import Rematch from "@rematch/core"
import createLoadingPlugin from "@rematch/loading"
import createPersistPlugin from "@rematch/persist"
import createSelectPlugin from "@rematch/select"
import storage from "redux-persist/lib/storage"
import { Omit } from "utility-types"
import { adminConfig } from "./admin-config"
import { globalConfig } from "./global-config"
import { remoteDataClient } from "./remote-data-client"
import { iam } from "./iam"
import { logger } from "./logger"
import { navigation } from "./navigation"
import { reports } from "./reports"
import * as Store from "./store.types"

const appModels: Omit<Store.AppModelConfigs, "loading"> = {
  adminConfig,
  globalConfig,
  remoteDataClient,
  iam,
  logger,
  navigation,
  reports,
}

const _store = Rematch.init({
  models: (appModels as unknown) as Rematch.Models, // Rematch types are difficult to work with :(
  plugins: [
    createLoadingPlugin({}),
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
