import { IamStoreModel, State } from "./types"
import { iam } from "./index"

const reducers: IamStoreModel["reducers"] = {
  reset: () => iam.state,
  update: (state, updater): State => ({ ...state, ...updater }),
}

export default reducers
