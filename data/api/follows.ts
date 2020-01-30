import { GetGotSuccessResponse, getgotRequest } from "./getgotRequest"
import {
  BLOCKED_USERS_MOCK_DATA,
  FOLLOWERS_MOCK_DATA,
  FOLLOWS_MOCK_DATA,
  SUGGESTED_INFLUENCERS_MOCK_DATA,
} from "./follows.mockData"

/********************
 * Types
 */

export type BlockedUser = UserType & {
  id: GUID
  blockedDate: ISO8601String
}

export type Follower = UserType & {
  id: GUID
  followedDate: ISO8601String
}

export type Followers = {
  followRequests: Follower[]
  followers: Follower[]
}

/********************
 * Blocked Users
 */

export interface BlockedUsersResponse extends GetGotSuccessResponse {
  results: BlockedUser[]
}

export const loadBlockedUsers = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<BlockedUsersResponse>("getblockedusers", {})
  return new Promise<BlockedUsersResponse>((resolve) => {
    setTimeout(resolve, 100, BLOCKED_USERS_MOCK_DATA)
  })
}

/********************
 * Followers
 */

export interface FollowersResponse extends GetGotSuccessResponse {
  result: Followers
}

export const loadFollowers = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<FollowsResponse>("getfollowers", {})
  return new Promise<FollowersResponse>((resolve) => {
    setTimeout(resolve, 100, FOLLOWERS_MOCK_DATA)
  })
}

/********************
 * Influencers
 */

export interface InfluencersResponse extends GetGotSuccessResponse {
  results: Influencer[]
}

export const loadInfluencers = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<FollowsResponse>("getinfluencers", {})
  return new Promise<InfluencersResponse>((resolve) => {
    setTimeout(resolve, 100, FOLLOWS_MOCK_DATA)
  })
}

/***********************
 * Influencer Followers
 */

export interface InfluencerFollowersResponse extends GetGotSuccessResponse {
  results: Follower[]
}

export const loadInfluencerFollowers = async (
  influencerUserId: GUID,
  search?: string,
  pageSize?: number
) => {
  return await getgotRequest<InfluencerFollowersResponse>("getInfluencerFollowers", {
    influencerUserId,
    search,
    pageSize,
  })
}

/************************
 * Suggested Influencers
 */

export interface SuggestedInfluencersResponse extends GetGotSuccessResponse {
  results: Influencer[]
}

export const loadSuggestedInfluencers = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<SuggestedInfluencersResponse>("getsuggestedfollows", {})
  return new Promise<SuggestedInfluencersResponse>((resolve) => {
    setTimeout(resolve, 100, SUGGESTED_INFLUENCERS_MOCK_DATA)
  })
}

/***********************
 * Start/Stop Following
 */

export const startFollowingInfluencer = async (influencerHandles: string | string[]) => {
  return await getgotRequest<GetGotSuccessResponse>("addSubscriptions", {
    handles: Array.isArray(influencerHandles) ? influencerHandles : [influencerHandles],
  })
}
export const stopFollowingInfluencer = async (influencerHandles: string | string[]) => {
  return await getgotRequest<GetGotSuccessResponse>("removeSubscriptions", {
    handles: Array.isArray(influencerHandles) ? influencerHandles : [influencerHandles],
  })
}
