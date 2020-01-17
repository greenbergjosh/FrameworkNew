import { routes } from "constants"
import { ExploreFeedDetailsScreen } from "./ExploreFeedDetailsScreen"
import { ExploreFeedCommentsScreen } from "./ExploreFeedCommentsScreen"
import { ExploreFeedScreen } from "./ExploreFeedScreen"
import { ExploreUserFeedDetailsScreen } from "./ExploreUserFeedDetailsScreen"
import { ExploreUserFeedScreen } from "./ExploreUserFeedScreen"
import { ExploreUserFollowsScreen } from "./ExploreUserFollowsScreen"

export const exploreRoutes = {
  [routes.Explore.Feed]: { screen: ExploreFeedScreen },
  [routes.Explore.FeedDetails]: { screen: ExploreFeedDetailsScreen },
  [routes.Explore.FeedComments]: { screen: ExploreFeedCommentsScreen },
  [routes.Explore.UserFeed]: { screen: ExploreUserFeedScreen },
  [routes.Explore.UserFeedDetails]: { screen: ExploreUserFeedDetailsScreen },
  [routes.Explore.UserFollows]: { screen: ExploreUserFollowsScreen },
  [routes.Explore.UserFollowsMutual]: { screen: ExploreUserFollowsScreen },
  [routes.Explore.UserFollowsFollowers]: { screen: ExploreUserFollowsScreen },
  [routes.Explore.UserFollowsInfluencers]: { screen: ExploreUserFollowsScreen },
}