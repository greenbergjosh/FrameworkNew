import { routes } from "constants"

const influencerFeedRoutes: FeedRoutes = {
  Feed: routes.Explore.UserFeed,
  FeedDetails: routes.Explore.UserFeedDetails,
  Followers: routes.Explore.UserFollowsFollowers,
  Influencers: routes.Explore.UserFollowsInfluencers,
  Campaign: routes.Explore.Campaign,
}

const profileFeedRoutes: FeedRoutes = {
  Feed: routes.Profile.Profile,
  FeedDetails: routes.Profile.PostDetails,
  Followers: routes.Follows.Followers,
  Influencers: routes.Follows.Influencers,
  Campaign: routes.Profile.PostDetails,
}

export {
  influencerFeedRoutes,
  profileFeedRoutes,
}
