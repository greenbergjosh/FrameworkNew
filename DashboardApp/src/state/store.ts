import * as Rematch from "@rematch/core"
import createLoadingPlugin from "@rematch/loading"
import createPersistPlugin from "@rematch/persist"
import createSelectPlugin from "@rematch/select"
import storage from "redux-persist/lib/storage"
import { Omit } from "utility-types"
import { apps } from "./apps"
import { feedback } from "./feedback"
import { globalConfig } from "./global-config"
import { iam } from "./iam"
import { logger } from "./logger"
import { navigation } from "./navigation"
import { remoteDataClient } from "../api/remote-data-client"
import { reports } from "./queries/reports"
import { queries } from "./queries/queries"
import * as Store from "./store.types"

const appModels: Omit<Store.AppModelConfigs, "loading"> = {
  apps,
  feedback,
  globalConfig,
  iam,
  logger,
  navigation,
  remoteDataClient,
  reports,
  queries,
}

const _store = Rematch.init({
  models: appModels as unknown as Rematch.Models, // Rematch types are difficult to work with :(
  plugins: [
    createLoadingPlugin({}),
    createPersistPlugin({
      key: "root",
      storage,
      whitelist: ["remoteDataClient", "queries"],
    }),
    createSelectPlugin(),
  ],
})

// exporting a customized version of the store with better type annotations
export const store = {
  ..._store,
  getState: _store.getState as () => Store.AppState,
  dispatch: _store.dispatch as unknown as Store.AppDispatch,
  select: _store.select as unknown as Store.AppSelectors,
}
