import { AppSelectors } from "../store.types"
import { IamStoreModel, Profile } from "./types"
import { Option } from "fp-ts/lib/Option"

const selectors: IamStoreModel["selectors"] = (slice, createSelector, hasProps) => ({
  profile(select: AppSelectors) {
    return createSelector<any, any>(
      slice((state) => state.profile),
      (profile: Option<Profile>) => {
        return profile.getOrElse({ Email: "", ImageUrl: "", Name: "" })
      }
    )
  },
})

export default selectors
