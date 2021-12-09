import effects from "./effects"
import reducers from "./reducers"
import selectors from "./selectors"
import { IamStoreModel } from "./types"
import { none } from "fp-ts/lib/Option"

export const iam: IamStoreModel = {
  state: {
    profile: none,
  },
  reducers,
  effects,
  selectors,
}
