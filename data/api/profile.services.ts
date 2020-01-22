import { getgotRequest, GetGotSuccessResponse } from "./getgotRequest"
import { NOTIFICATION_SETTINGS_MOCK_DATA, PRIVACYOPTIONS_MOCK_DATA, PROFILE_MOCK_DATA } from "./profile.services.mockData"

/********************
 * Types
 */

export type SettingType = {
  id: GUID
  title: string
  description: string
  checked: boolean
}

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

export interface ProfileResponse extends GetGotSuccessResponse {
  result: ProfileType
}

export const loadProfile = async (profileId: GUID) => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<ProfileResponse>("get_user_profile", { id: profileId })
  return new Promise<ProfileResponse>((resolve) => {
    setTimeout(resolve, 100, PROFILE_MOCK_DATA)
  })
}

/********************
 * Privacy Options
 */

export interface PrivacyOptionsResponse extends GetGotSuccessResponse {
  results: SettingType[]
}

export const loadPrivacyOptions = async (userId: GUID) => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<PrivacyOptionsResponse>("??????", { id: userId })
  return new Promise<PrivacyOptionsResponse>((resolve) => {
    setTimeout(resolve, 100, PRIVACYOPTIONS_MOCK_DATA)
  })
}

/********************
 * Privacy Options
 */

export interface NotificationSettingsResponse extends GetGotSuccessResponse {
  results: SettingType[]
}

export const loadNotificationSettings = async (userId: GUID) => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<NotificationSettingsResponse>("??????", { id: userId })
  return new Promise<NotificationSettingsResponse>((resolve) => {
    setTimeout(resolve, 100, NOTIFICATION_SETTINGS_MOCK_DATA)
  })
}
