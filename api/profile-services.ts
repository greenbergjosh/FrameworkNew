import { getgotRequest, GetGotSuccessResponse } from "./index"
import { interests } from "api/catalog-services"

/********************
 * Contacts
 */

export interface SyncContactsResponse extends GetGotSuccessResponse {}

export const syncContacts = async (
  contacts: {
    fname?: string | null
    lname?: string | null
    phone?: string | null
    email?: string | null
    dob?: string | null
    gender: null
  }[]
) => {
  return await getgotRequest<SyncContactsResponse>("synccontacts", { contacts })
}

/********************
 * User Interests
 */

export interface UserInterestsResponse extends GetGotSuccessResponse {}

export const saveUserInterests = async (interestIds: number[]) => {
  return await getgotRequest<UserInterestsResponse>("followintrsts", { interests: interestIds })
}