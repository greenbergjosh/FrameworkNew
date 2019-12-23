import { getgotRequest, GetGotSuccessResponse } from "./index"
import { suggestedFollows } from "./onboarding-services.mockData"
import { SID } from "constants/appkeys"
import { FeedItemType } from "./feed-services"

/********************
 * Send Code
 */

export interface SendCodeResponse extends GetGotSuccessResponse {}

export const sendCode = async (contact: string) => {
  return await getgotRequest<SendCodeResponse>("sendcode", { u: contact })
}

/********************
 * Submit Code
 */
export interface SubmitCodeResponse extends GetGotSuccessResponse {}

export interface CreateUserResponse extends GetGotSuccessResponse {
  name: string
  email: string
  handle: string
  imageurl: string
  h: string
}

export const submitCode = async (contact: string, code: string) => {
  return await getgotRequest<SubmitCodeResponse>("submitcnfmcode", { u: contact, code })
}

/********************
 * Create User
 */

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
    SID
  )
}

/********************
 * Suggested Follows
 */

export type Influencer = UserInfoType & {
  description?: string
  source?: string
  feed: FeedItemType[]
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
