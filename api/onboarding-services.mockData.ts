import { ImageUris } from "constants"
import { SuggestedFollowsResponse } from "./onboarding-services"
import { FEED_DATA } from "./feed-services.mockData"

export const suggestedFollows: SuggestedFollowsResponse = {
  r: 0,
  results: [
    {
      userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb52",
      handle: "boren",
      avatarUri: ImageUris.placeholder,
      description: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      source: "From your contacts",
      feed: [...FEED_DATA.feed.slice(0, 3)],
    },
    {
      userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb53",
      handle: "snoren",
      avatarUri: ImageUris.placeholder,
      description: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      source: "From your contacts",
      feed: [...FEED_DATA.feed.slice(0, 3)],
    },
    {
      userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb54",
      handle: "goren",
      avatarUri: ImageUris.placeholder,
      description: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      source: "From your contacts",
      feed: [...FEED_DATA.feed.slice(0, 3)],
    },
  ],
}
