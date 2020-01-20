import { GetGotSuccessResponse } from "./getgotRequest"
import { interests } from "./catalog.services.mockData"

/********************
 * Interests
 */

export type Interest = {
  id: number
  groupId: number
  name: string
  description: string
}

export type InterestGroup = {
  id: number
  name: string
  description: string
  interests: Interest[]
}

export interface InterestsResponse extends GetGotSuccessResponse {
  results: InterestGroup[]
}

export const loadInterests = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<InterestsResponse>("getinterests", {})
  return new Promise<InterestsResponse>((resolve) => {
    setTimeout(resolve, 2000, interests)
  })
}
