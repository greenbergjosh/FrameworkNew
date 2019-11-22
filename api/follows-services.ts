import { getgotRequest, GetGotResponse, GetGotSuccessResponse } from "./index"
import { ImageUris } from "constants"

/********************
 * Influencers
 */

export type Influencer = {
  id: number
  userId: GUID
  avatarUri: string
  handle: string
  statusPhrase: {
    template: string
    data?: {}
  }
  feedImagesSmall?: string[]
  timeStamp: ISO8601String
}

// TODO: Fetch this from the API
export const follows: InfluencersResponse = {
  r: 0,
  results: [
    {
      id: 1,
      userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
      avatarUri: ImageUris.placeholder,
      handle: "erynearly",
      statusPhrase: {
        template: "liked 2 posts.",
      },
      feedImagesSmall: [
        ImageUris.placeholder,
        ImageUris.placeholder,
        ImageUris.placeholder,
        ImageUris.placeholder,
        ImageUris.placeholder,
      ],
      timeStamp: "2019-11-07T07:00:00+04:00",
    },
    {
      id: 2,
      userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
      avatarUri: ImageUris.placeholder,
      handle: "itsdyasia",
      statusPhrase: {
        template: "liked {user.handle}'s comment: {comment}",
        data: {
          user: { id: "8e3a5bb7-2a0f-429f-9925-d76481209989", handle: "haelise" },
          comment: "the curlssssss",
        },
      },
      feedImagesSmall: [ImageUris.placeholder],
      timeStamp: "2019-11-07T07:00:00+09:00",
    },
    {
      id: 3,
      userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
      avatarUri: ImageUris.placeholder,
      handle: "idk_just_stan_bts",
      statusPhrase: {
        template: "liked {user.handle}'s post.",
        data: {
          user: { id: "34ad34f2-ae0f-49a5-9cf0-08dbd84b4c5a", handle: "haelise" },
        },
      },
      feedImagesSmall: [ImageUris.placeholder],
      timeStamp: "2019-11-22T07:00:00+12:00",
    },
  ],
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

/********************
 * Followers
 */

export type Follower = {
  id: number
  userId: GUID
  avatarUri: string
  handle: string
  name: string
}

// TODO: Fetch this from the API
export const followers: FollowersResponse = {
  r: 0,
  results: [
    {
      id: 1,
      userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
      avatarUri: ImageUris.placeholder,
      handle: "erynearly",
      name: "Follower Name",
    },
    {
      id: 2,
      userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
      avatarUri: ImageUris.placeholder,
      handle: "itsdyasia",
      name: "Follower Name",
    },
    {
      id: 3,
      userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
      avatarUri: ImageUris.placeholder,
      handle: "idk_just_stan_bts",
      name: "Follower Name",
    },
  ],
}

export interface FollowersResponse extends GetGotSuccessResponse {
  results: Follower[]
}

export const loadFollowers = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<FollowsResponse>("getfollowers", {})
  return new Promise<FollowersResponse>((resolve) => {
    setTimeout(resolve, 100, followers)
  })
}
