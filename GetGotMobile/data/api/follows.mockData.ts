import {
  BlockedUsersResponse,
  FollowersResponse,
  InfluencersResponse,
  SuggestedInfluencersResponse,
} from "./follows"
import { FEED_MOCK_DATA } from "./feed.mockData"

export const BLOCKED_USERS_MOCK_DATA: BlockedUsersResponse = {
  r: 0,
  results: [
    {
      id: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
      userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
      avatarUri: "https://randomuser.me/api/portraits/women/9.jpg",
      handle: "erynearly",
      name: "Blocked User Name",
      blockedDate: "2019-11-25T07:00:00+12:00",
    },
    {
      id: "8568ffe3-6346-4486-b1d0-be843dcaac25",
      userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
      avatarUri: "https://randomuser.me/api/portraits/women/10.jpg",
      handle: "itsdyasia",
      name: "Blocked User Name",
      blockedDate: "2019-11-24T07:00:00+12:00",
    },
    {
      id: "37c240b4-b18c-4239-90ca-fea6b10167b0",
      userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
      avatarUri: "https://randomuser.me/api/portraits/women/11.jpg",
      handle: "idk_just_stan_bts",
      name: "Blocked User Name",
      blockedDate: "2019-11-11T07:00:00+12:00",
    },
  ],
}

export const FOLLOWERS_MOCK_DATA: FollowersResponse = {
  r: 0,
  result: {
    followRequests: [
      {
        id: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
        userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
        avatarUri: "https://randomuser.me/api/portraits/women/12.jpg",
        handle: "booberry",
        name: "Follower Name",
        followedDate: "2019-11-25T07:00:00+12:00",
      },
    ],
    followers: [
      {
        id: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
        userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
        avatarUri: "https://randomuser.me/api/portraits/women/13.jpg",
        handle: "erynearly",
        name: "Follower Name",
        followedDate: "2019-11-25T07:00:00+12:00",
      },
      {
        id: "8568ffe3-6346-4486-b1d0-be843dcaac25",
        userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
        avatarUri: "https://randomuser.me/api/portraits/women/14.jpg",
        handle: "itsdyasia",
        name: "Follower Name",
        followedDate: "2019-11-24T07:00:00+12:00",
      },
      {
        id: "37c240b4-b18c-4239-90ca-fea6b10167b0",
        userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
        avatarUri: "https://randomuser.me/api/portraits/women/14.jpg",
        handle: "idk_just_stan_bts",
        name: "Follower Name",
        followedDate: "2019-11-11T07:00:00+12:00",
      },
    ],
  },
}

export const FOLLOWS_MOCK_DATA: InfluencersResponse = {
  r: 0,
  results: [
    {
      id: "8568ffe3-6346-4486-b1d0-be843dcaac25",
      userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
      avatarUri: "https://randomuser.me/api/portraits/women/20.jpg",
      handle: "itsdyasia",
      statusPhrase: {
        template: "liked {user.handle}'s comment: {comment}",
        data: {
          user: { id: "8e3a5bb7-2a0f-429f-9925-d76481209989", handle: "haelise" },
          comment: "the curlssssss",
        },
      },
      feed: [FEED_MOCK_DATA.results[0]],
      lastActivity: "2019-11-26T15:04:44.477Z",
    },
    {
      id: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
      userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
      avatarUri: "https://randomuser.me/api/portraits/women/21.jpg",
      handle: "erynearly",
      statusPhrase: {
        template: "liked 2 posts.",
      },
      feed: [
        FEED_MOCK_DATA.results[1],
        FEED_MOCK_DATA.results[2],
        FEED_MOCK_DATA.results[3],
        FEED_MOCK_DATA.results[4],
      ],
      lastActivity: "2019-11-26T12:04:44.477Z",
    },
    {
      id: "37c240b4-b18c-4239-90ca-fea6b10167b0",
      userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
      avatarUri: "https://randomuser.me/api/portraits/women/23.jpg",
      handle: "idk_just_stan_bts",
      statusPhrase: {
        template: "liked {user.handle}'s post.",
        data: {
          user: { id: "34ad34f2-ae0f-49a5-9cf0-08dbd84b4c5a", handle: "haelise" },
        },
      },
      feed: [FEED_MOCK_DATA.results[5]],
      lastActivity: "2019-11-24T09:00:00+05:00",
    },
  ],
}

export const SUGGESTED_INFLUENCERS_MOCK_DATA: SuggestedInfluencersResponse = {
  r: 0,
  results: [
    {
      id: "37c240b4-b18c-4239-90ca-fea6b10167b0",
      userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb52",
      avatarUri: "https://randomuser.me/api/portraits/women/20.jpg",
      handle: "boren",
      bio: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      statusPhrase: {
        template: "From your contacts",
      },
      feed: [...FEED_MOCK_DATA.results.slice(0, 3)],
      lastActivity: "2019-11-24T09:00:00+05:00",
    },
    {
      id: "37c240b4-b18c-4239-90ca-fea6b10167b1",
      userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb53",
      avatarUri: "https://randomuser.me/api/portraits/women/21.jpg",
      handle: "snoren",
      bio: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      statusPhrase: {
        template: "From your contacts",
      },
      feed: [...FEED_MOCK_DATA.results.slice(3, 6)],
      lastActivity: "2019-11-24T09:00:00+05:00",
    },
    {
      id: "37c240b4-b18c-4239-90ca-fea6b10167b2",
      userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb54",
      avatarUri: "https://randomuser.me/api/portraits/women/23.jpg",
      handle: "goren",
      bio: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      statusPhrase: {
        template: "From your contacts",
      },
      feed: [...FEED_MOCK_DATA.results.slice(6, 9)],
      lastActivity: "2019-11-24T09:00:00+05:00",
    },
    {
      id: "37c240b4-b18c-4239-90ca-fea6b10167b3",
      userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb52",
      avatarUri: "https://randomuser.me/api/portraits/women/24.jpg",
      handle: "bajoren",
      bio: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      statusPhrase: {
        template: "From your contacts",
      },
      feed: [...FEED_MOCK_DATA.results.slice(0, 3)],
      lastActivity: "2019-11-24T09:00:00+05:00",
    },
    {
      id: "37c240b4-b18c-4239-90ca-fea6b10167b4",
      userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb53",
      avatarUri: "https://randomuser.me/api/portraits/women/25.jpg",
      handle: "katorin",
      bio: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      statusPhrase: {
        template: "From your contacts",
      },
      feed: [...FEED_MOCK_DATA.results.slice(3, 6)],
      lastActivity: "2019-11-24T09:00:00+05:00",
    },
    {
      id: "37c240b4-b18c-4239-90ca-fea6b10167b5",
      userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb54",
      avatarUri: "https://randomuser.me/api/portraits/women/26.jpg",
      handle: "orin",
      bio: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      statusPhrase: {
        template: "From your contacts",
      },
      feed: [...FEED_MOCK_DATA.results.slice(6, 9)],
      lastActivity: "2019-11-24T09:00:00+05:00",
    },
  ],
}
