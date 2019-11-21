import { getgotRequest, GetGotSuccessResponse } from "./index"
import { ImageUris } from "constants"
import { InfluencerTokens } from "../screens/main/promotions/PromotionsCampaignScreen"
import { Interest } from "./catalog-services"

export interface SendCodeResponse extends GetGotSuccessResponse {}
export interface SubmitCodeResponse extends GetGotSuccessResponse {}
export interface CreateUserResponse extends GetGotSuccessResponse {
  name: string
  email: string
  handle: string
  imageurl: string
  h: string
}

const sid = "62ffd1da-5bc0-480b-9d47-e63df93ade30"

export const sendCode = async (contact: string) => {
  return await getgotRequest<SendCodeResponse>("sendcode", { u: contact })
}

export const submitCode = async (contact: string, code: string) => {
  return await getgotRequest<SubmitCodeResponse>("submitcode", { u: contact, code })
}

export const createUser = async (
  handle: string,
  password: string,
  device: string,
  contact: string,
  code: string
) => {
  return await getgotRequest<CreateUserResponse>(
    "createpass",
    {
      n: handle,
      p: password,
      d: device,
      u: contact,
      c: code,
    },
    null,
    sid
  )
}

/********************
 * Suggested Follows
 */

export type Influencer = {
  userId: number
  name: string
  avatar?: string | null
  description?: string | null
  source?: string | null
  feedImages: string[]
}

// TODO: Fetch this from the API
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

export interface SuggestedFollowsResponse extends GetGotSuccessResponse {
  results: Influencer[]
}

export const loadSuggestedFollows = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<SuggestedFollowsResponse>("getsuggestedfollows", {})
  return new Promise<SuggestedFollowsResponse>((resolve) => {
    setTimeout(resolve, 100, suggestedFollows)
  })
}
