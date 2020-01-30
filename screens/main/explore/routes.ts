import { routes } from "constants"
import { FeedDetailsScreen } from "./FeedDetailsScreen"
import { FeedCommentsScreen } from "./FeedCommentsScreen"
import { FeedScreen } from "./FeedScreen"
import { UserFeedDetailsScreen } from "./UserFeedDetailsScreen"
import { UserFeedScreen } from "./UserFeedScreen"
import { UserFollowsScreen } from "./UserFollowsScreen"

export const exploreRoutes = {
  [routes.Explore.Feed]: { screen: FeedScreen },
  [routes.Explore.FeedDetails]: { screen: FeedDetailsScreen },
  [routes.Explore.FeedComments]: { screen: FeedCommentsScreen },
  [routes.Explore.UserFeed]: { screen: UserFeedScreen },
  [routes.Explore.UserFeedDetails]: { screen: UserFeedDetailsScreen },
  [routes.Explore.UserFollows]: { screen: UserFollowsScreen },
  [routes.Explore.UserFollowsMutual]: { screen: UserFollowsScreen },
  [routes.Explore.UserFollowsFollowers]: { screen: UserFollowsScreen },
  [routes.Explore.UserFollowsInfluencers]: { screen: UserFollowsScreen },
}