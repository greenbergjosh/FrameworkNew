import { getgotRequest, GetGotSuccessResponse } from "./index"

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

/********************
 * User Settings
 */

export type SettingType = {
  id: GUID
  title: string
  description: string
  checked: boolean
}