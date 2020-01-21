import { SuggestedFollowsResponse } from "./onBoarding.services"
import { FEED_DATA } from "./feed.services.mockData"

export const suggestedFollows: SuggestedFollowsResponse = {
  r: 0,
  results: [
    {
      userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb52",
      handle: "boren",
      avatarUri: "https://randomuser.me/api/portraits/women/20.jpg",
      description: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      source: "From your contacts",
      feed: [...FEED_DATA.results.slice(0, 3)],
    },
    {
      userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb53",
      handle: "snoren",
      avatarUri: "https://randomuser.me/api/portraits/women/21.jpg",
      description: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      source: "From your contacts",
      feed: [...FEED_DATA.results.slice(3, 6)],
    },
    {
      userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb54",
      handle: "goren",
      avatarUri: "https://randomuser.me/api/portraits/women/23.jpg",
      description: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      source: "From your contacts",
      feed: [...FEED_DATA.results.slice(6, 9)],
    },
  ],
}
