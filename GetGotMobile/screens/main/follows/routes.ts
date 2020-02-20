import { routes } from "routes"
import { FollowsScreen } from "./FollowsScreen"

export const followsRoutes = {
  [routes.Follows.default]: { screen: FollowsScreen },
  [routes.Follows.Followers]: { screen: FollowsScreen },
  [routes.Follows.Influencers]: { screen: FollowsScreen },
}
