import { ImageUris } from "constants"

export const FEED_DATA = {
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

export const USER_FEED_DATA = {
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
  ],
}
