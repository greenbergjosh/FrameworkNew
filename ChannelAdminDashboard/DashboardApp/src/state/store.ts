import storage from "redux-persist/lib/storage"

import Rematch from "@rematch/core"
import createLoadingPlugin from "@rematch/loading"
import createPersistPlugin from "@rematch/persist"
import createSelectPlugin from "@rematch/select"

import { globalConfig } from "./global-config"
import { iam } from "./iam"
import { navigation } from "./navigation"
import { reports } from "./reports"
import * as Store from "./store.types"

// ignoring types from Rematch because they're impossible to work with
// @ts-ignore
const _store = Rematch.init({
  models: {
    globalConfig,
    iam,
    navigation,
    reports,
  },
  plugins: [
    createLoadingPlugin(),
    createPersistPlugin({ storage, whitelist: [] }),
    createSelectPlugin(),
  ],
})

export const store = {
  ..._store,
  getState: _store.getState as () => Store.AppState,
  dispatch: _store.dispatch as Store.AppDispatch,
  select: (_store.select as unknown) as Store.AppSelectors,
}
