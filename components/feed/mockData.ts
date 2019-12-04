import { ImageUris } from "constants"

export type FeedItemType = {
  uri: string
  id: number
  height?: number
  user?: UserInfoType
}

export type UserInfoType = {
  userId: number
  handle: string
  avatarUri: string
}

export const FEED_DATA: { feed: FeedItemType[] } = {
  feed: [
    { uri: ImageUris.placeholder, id: 1 },
    { uri: ImageUris.placeholder, id: 2 },
    { uri: ImageUris.placeholder, id: 3 },
    { uri: ImageUris.placeholder, id: 4 },
    { uri: ImageUris.placeholder, id: 5 },
    { uri: ImageUris.placeholder, id: 6 },
    { uri: ImageUris.placeholder, id: 7 },
    { uri: ImageUris.placeholder, id: 8 },
    { uri: ImageUris.placeholder, id: 9 },
    { uri: ImageUris.placeholder, id: 10 },
    { uri: ImageUris.placeholder, id: 11 },
    { uri: ImageUris.placeholder, id: 12 },
    { uri: ImageUris.placeholder, id: 13 },
    { uri: ImageUris.placeholder, id: 14 },
    { uri: ImageUris.placeholder, id: 15 },
    { uri: ImageUris.placeholder, id: 16 },
    { uri: ImageUris.placeholder, id: 17 },
    { uri: ImageUris.placeholder, id: 18 },
    { uri: ImageUris.placeholder, id: 19 },
    { uri: ImageUris.placeholder, id: 20 },
    { uri: ImageUris.placeholder, id: 21 },
    { uri: ImageUris.placeholder, id: 22 },
    { uri: ImageUris.placeholder, id: 23 },
    { uri: ImageUris.placeholder, id: 24 },
    { uri: ImageUris.placeholder, id: 25 },
    { uri: ImageUris.placeholder, id: 26 },
    { uri: ImageUris.placeholder, id: 27 },
  ],
}

export const FEED_DETAILS_DATA: { feed: FeedItemType[] } = {
  feed: [
    {
      id: 1,
      uri: ImageUris.placeholder,
      height: 435,
      user: {
        userId: 1,
        handle: "loren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: 2,
      uri: ImageUris.placeholder,
      height: 300,
      user: {
        userId: 2,
        handle: "snoren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: 3,
      uri: ImageUris.placeholder,
      height: 435,
      user: {
        userId: 3,
        handle: "goren",
        avatarUri: ImageUris.placeholder,
      },
    },
  ],
}

export const USER_FEED_DATA: { user: UserInfoType, feed: FeedItemType[] } = {
  user: {
    userId: 1,
    handle: "loren",
    avatarUri: ImageUris.placeholder,
  },
  feed: [
    { uri: ImageUris.placeholder, id: 1 },
    { uri: ImageUris.placeholder, id: 2 },
    { uri: ImageUris.placeholder, id: 3 },
    { uri: ImageUris.placeholder, id: 4 },
    { uri: ImageUris.placeholder, id: 5 },
    { uri: ImageUris.placeholder, id: 6 },
    { uri: ImageUris.placeholder, id: 7 },
    { uri: ImageUris.placeholder, id: 8 },
    { uri: ImageUris.placeholder, id: 9 },
    { uri: ImageUris.placeholder, id: 10 },
    { uri: ImageUris.placeholder, id: 11 },
    { uri: ImageUris.placeholder, id: 12 },
    { uri: ImageUris.placeholder, id: 13 },
    { uri: ImageUris.placeholder, id: 14 },
    { uri: ImageUris.placeholder, id: 15 },
    { uri: ImageUris.placeholder, id: 16 },
    { uri: ImageUris.placeholder, id: 17 },
    { uri: ImageUris.placeholder, id: 18 },
    { uri: ImageUris.placeholder, id: 19 },
    { uri: ImageUris.placeholder, id: 20 },
    { uri: ImageUris.placeholder, id: 21 },
    { uri: ImageUris.placeholder, id: 22 },
    { uri: ImageUris.placeholder, id: 23 },
    { uri: ImageUris.placeholder, id: 24 },
    { uri: ImageUris.placeholder, id: 25 },
    { uri: ImageUris.placeholder, id: 26 },
    { uri: ImageUris.placeholder, id: 27 },
  ],
}

export const USER_FEED_DETAILS_DATA: { user: UserInfoType, feed: FeedItemType[] } = {
  user: {
    userId: 1,
    handle: "loren",
    avatarUri: ImageUris.placeholder,
  },
  feed: [
    {
      id: 1,
      uri: ImageUris.placeholder,
      height: 435,
    },
    {
      id: 2,
      uri: ImageUris.placeholder,
      height: 300,
    },
    {
      id: 3,
      uri: ImageUris.placeholder,
      height: 435,
    },
    {
      id: 4,
      uri: ImageUris.placeholder,
      height: 435,
    },
    {
      id: 5,
      uri: ImageUris.placeholder,
      height: 300,
    },
    {
      id: 6,
      uri: ImageUris.placeholder,
      height: 435,
    },
    {
      id: 7,
      uri: ImageUris.placeholder,
      height: 435,
    },
    {
      id: 8,
      uri: ImageUris.placeholder,
      height: 300,
    },
    {
      id: 9,
      uri: ImageUris.placeholder,
      height: 435,
    },
    {
      id: 10,
      uri: ImageUris.placeholder,
      height: 435,
    },
    {
      id: 11,
      uri: ImageUris.placeholder,
      height: 300,
    },
    {
      id: 12,
      uri: ImageUris.placeholder,
      height: 435,
    },
  ],
}
