import { GetGotSuccessResponse } from "api"
import { blockedUsers, followers, follows } from "./follows-services.mockData"

/********************
 * Blocked Users
 */

export type BlockedUser = UserInfoType & {
  id: number
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

export type Follower = UserInfoType & {
  id: number
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

export type Influencer = UserInfoType & {
  id: number
  statusPhrase: {
    template: string
    data?: {}
  }
  feedImagesSmall?: string[]
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
