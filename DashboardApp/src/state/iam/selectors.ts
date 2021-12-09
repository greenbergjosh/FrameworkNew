import { AppSelectors } from "../store.types"
import { IamStoreModel } from "./types"

const selectors: IamStoreModel["selectors"] = (slice, createSelector, hasProps) => ({
  profile(select: AppSelectors) {
    return createSelector(
      slice((state) => state.profile),
      (profile) => {
        return profile.getOrElse({ Email: "", ImageUrl: "", Name: "" })
      }
    )
  },
})

export default selectors
