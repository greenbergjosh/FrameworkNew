import { GetGotSuccessResponse, getgotRequest } from "api"
import { blockedUsers, followers, follows } from "./follows-services.mockData"
import { PostType } from "./feed-services"

/********************
 * Blocked Users
 */

export type BlockedUser = UserType & {
  id: GUID
  name: string
  blockedDate: ISO8601String
}

export interface BlockedUsersResponse extends GetGotSuccessResponse {
  results: BlockedUser[]
}

export const loadBlockedUsers = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<BlockedUsersResponse>("getblockedusers", {})
  return new Promise<BlockedUsersResponse>((resolve) => {
    setTimeout(resolve, 100, blockedUsers)
  })
}

/********************
 * Followers
 */

export type Followers = {
  followRequests: Follower[]
  followers: Follower[]
}

export type Follower = UserType & {
  id: GUID
  name: string
  followedDate: ISO8601String
}

export interface FollowersResponse extends GetGotSuccessResponse {
  result: Followers
}

export const loadFollowers = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<FollowsResponse>("getfollowers", {})
  return new Promise<FollowersResponse>((resolve) => {
    setTimeout(resolve, 100, followers)
  })
}

/********************
 * Influencers
 */

export type Influencer = UserType & {
  id: GUID
  statusPhrase: {
    template: string
    data?: {}
  }
  feed?: PostType[]
  lastActivity: ISO8601String
}

export interface InfluencersResponse extends GetGotSuccessResponse {
  results: Influencer[]
}

export const loadInfluencers = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<FollowsResponse>("getinfluencers", {})
  return new Promise<InfluencersResponse>((resolve) => {
    setTimeout(resolve, 100, follows)
  })
}

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
