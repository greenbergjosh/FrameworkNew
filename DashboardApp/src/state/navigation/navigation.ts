import * as Reach from "@reach/router"
import * as Store from "../store.types"
import { Effects, Reducers, RoutesMap, Selectors, State } from "./types"
import { routes } from "./routes"

export const navigation: Store.AppModel<State<RoutesMap>, Reducers, Effects, Selectors> = {
  state: { routes },

  reducers: {},

  effects: () => ({
    navigate(path, rootState, navOptions) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      return Reach.navigate(String(path), navOptions as Reach.NavigateOptions<{}>)
    },
  }),

  selectors: (slice, createSelector) => ({
    routes(select) {
      return () => routes
    },
  }),
}
