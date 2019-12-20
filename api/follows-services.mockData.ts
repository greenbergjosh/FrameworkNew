import { ImageUris } from "constants"
import { BlockedUsersResponse } from "./follows-services"
import { FollowersResponse } from "./follows-services"
import { InfluencersResponse } from "./follows-services"

export const blockedUsers: BlockedUsersResponse = {
  r: 0,
  results: [
    {
      id: 1,
      userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
      avatarUri: ImageUris.placeholder,
      handle: "erynearly",
      name: "Blocked User Name",
      blockedDate: "2019-11-25T07:00:00+12:00",
    },
    {
      id: 2,
      userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
      avatarUri: ImageUris.placeholder,
      handle: "itsdyasia",
      name: "Blocked User Name",
      blockedDate: "2019-11-24T07:00:00+12:00",
    },
    {
      id: 3,
      userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
      avatarUri: ImageUris.placeholder,
      handle: "idk_just_stan_bts",
      name: "Blocked User Name",
      blockedDate: "2019-11-11T07:00:00+12:00",
    },
  ],
}

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

export const follows: InfluencersResponse = {
  r: 0,
  results: [
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
      lastActivity: "2019-11-26T15:04:44.477Z",
    },
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
      lastActivity: "2019-11-26T12:04:44.477Z",
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
      lastActivity: "2019-11-24T09:00:00+05:00",
    },
  ],
}
