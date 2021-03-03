import { AppsStoreModel } from "./types"

const reducers: AppsStoreModel["reducers"] = {
  update: (state, payload) => ({ ...state, ...payload }),
}

export default reducers
