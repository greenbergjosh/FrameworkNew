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
  return await getgotRequest<SyncContactsResponse>("syncContacts", { contacts })
}

/********************
 * User Interests
 */

export interface UserInterestsResponse extends GetGotSuccessResponse {}

export const saveUserInterests = async (interestIds: number[]) => {
  return await getgotRequest<UserInterestsResponse>("followInterests", { interests: interestIds })
}

/********************
 * User Profile
 */

export interface UserProfileResponse extends GetGotSuccessResponse {
  result: UserType
}

export const loadProfile = async (profileId?: number | string) => {
  return await getgotRequest<UserProfileResponse>("get_user_profile", { id: profileId })
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
