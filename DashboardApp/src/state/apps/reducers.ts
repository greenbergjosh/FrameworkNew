import { AppsStoreModel } from "./types"

const reducers: AppsStoreModel["reducers"] = {
  update: (state, payload) => ({ ...state, ...payload }),
  updateAppConfigs: (state, payload) => ({ ...state, appConfigs: { ...payload } }),
}

export default reducers
