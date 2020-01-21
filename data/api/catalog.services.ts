import { GetGotSuccessResponse } from "./getgotRequest"
import { interests } from "./catalog.services.mockData"

/********************
 * Interests
 */

export type InterestType = {
  id: number
  groupId: number
  name: string
  description: string
}

export type InterestGroupType = {
  id: number
  name: string
  description: string
  interests: InterestType[]
}

export interface InterestsResponse extends GetGotSuccessResponse {
  results: InterestGroupType[]
}

export const loadInterests = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<InterestsResponse>("getinterests", {})
  return new Promise<InterestsResponse>((resolve) => {
    setTimeout(resolve, 2000, interests)
  })
}
