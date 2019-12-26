import { ImageUris } from "constants"
import { GetGotSuccessResponse, getgotRequest } from "api"
import { UserInfoType } from "api/profile-services"

/************************************************************
 * Followers
 */

export type Followers = {
  followRequests: Follower[]
  followers: Follower[]
}

export type Follower = {
  id: number
  userId: GUID
  avatarUri: string
  handle: string
  name: string
  followedDate: ISO8601String
}

// TODO: Fetch this from the API
export const followers: FollowersResponse = {
  r: 0,
  result: {
    followRequests: [
      {
        id: 4,
        userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
        avatarUri: ImageUris.placeholder,
        handle: "booberry",
        name: "Follower Name",
        followedDate: "2019-11-25T07:00:00+12:00",
      },
    ],
    followers: [
      {
        id: 1,
        userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
        avatarUri: ImageUris.placeholder,
        handle: "erynearly",
        name: "Follower Name",
        followedDate: "2019-11-25T07:00:00+12:00",
      },
      {
        id: 2,
        userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
        avatarUri: ImageUris.placeholder,
        handle: "itsdyasia",
        name: "Follower Name",
        followedDate: "2019-11-24T07:00:00+12:00",
      },
      {
        id: 3,
        userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
        avatarUri: ImageUris.placeholder,
        handle: "idk_just_stan_bts",
        name: "Follower Name",
        followedDate: "2019-11-11T07:00:00+12:00",
      },
    ],
  },
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

export interface UserProfileListResponse extends GetGotSuccessResponse {
  results: UserInfoType[]
}

export const loadInfluencerFollowers = async (
  influencerUserId: string,
  search?: string,
  pageSize?: number
) => {
  return await getgotRequest<UserProfileListResponse>("getInfluencerFollowers", {
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
