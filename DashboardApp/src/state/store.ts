import * as Rematch from "@rematch/core"
import createLoadingPlugin from "@rematch/loading"
import createPersistPlugin from "@rematch/persist"
import createSelectPlugin from "@rematch/select"
import storage from "redux-persist/lib/storage"
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

// Rematch types are difficult to work with :(
const initConfig: Rematch.InitConfig<any, any> = {
  models: {
    apps,
    feedback,
    globalConfig,
    iam,
    logger,
    navigation,
    remoteDataClient,
    reports,
    queries,
  },
  plugins: [
    createLoadingPlugin({}),
    createPersistPlugin({
      key: "root",
      storage,
      whitelist: ["remoteDataClient", "queries"],
    }),
    createSelectPlugin(),
  ],
}

const _store = Rematch.init(initConfig)

// exporting a customized version of the store with better type annotations
export const store = {
  ..._store,
  getState: _store.getState as () => Store.AppState,
  dispatch: _store.dispatch as unknown as Store.AppDispatch,
  select: _store.select as unknown as Store.AppSelectors,
}
