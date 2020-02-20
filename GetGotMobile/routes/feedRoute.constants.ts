import { routes } from "./route.constants"

const influencerFeedRoutes: FeedRoutesType = {
  Feed: routes.Explore.UserFeed,
  FeedDetails: routes.Explore.UserFeedDetails,
  Followers: routes.Explore.UserFollowsFollowers,
  Influencers: routes.Explore.UserFollowsInfluencers,
  Campaign: routes.Promotions.Campaign,
}

const profileFeedRoutes: FeedRoutesType = {
  Feed: routes.Profile.Profile,
  FeedDetails: routes.Profile.PostDetails,
  Followers: routes.Follows.Followers,
  Influencers: routes.Follows.Influencers,
  Campaign: routes.Promotions.Campaign,
}

export {
  influencerFeedRoutes,
  profileFeedRoutes,
}
