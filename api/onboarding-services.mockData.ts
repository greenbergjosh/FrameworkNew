import { ImageUris } from "constants"
import { SuggestedFollowsResponse } from "./onboarding-services"

export const suggestedFollows: SuggestedFollowsResponse = {
  r: 0,
  results: [
    {
      userId: 1,
      name: "loren",
      avatar: ImageUris.placeholder,
      description: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      source: "From your contacts",
      feedImages: [ImageUris.placeholder, ImageUris.placeholder, ImageUris.placeholder],
    },
    {
      userId: 2,
      name: "snoren",
      avatar: ImageUris.placeholder,
      description: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      source: "From your contacts",
      feedImages: [ImageUris.placeholder, ImageUris.placeholder, ImageUris.placeholder],
    },
    {
      userId: 3,
      name: "boren",
      avatar: ImageUris.placeholder,
      description: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
      source: "From your contacts",
      feedImages: [ImageUris.placeholder, ImageUris.placeholder, ImageUris.placeholder],
    },
  ],
}