import { getgotRequest, GetGotSuccessResponse } from "./index"

/********************
 * Login
 */

export interface LoginData {
  id?: string
  email: string
  handle: string
  imageurl: string
  name: string | null
  t: string
}

export interface LoginResponse extends LoginData, GetGotSuccessResponse {}

export const getgotLogin = async (username: string, password: string, device: string) => {
  return await getgotRequest<LoginResponse>("login", {
    u: username,
    p: password,
    d: device,
  })
}

/********************
 * Profile
 */

export interface ProfileResponse extends GetGotSuccessResponse {
  id: string
  email?: string
  handle: string
  profile_image_url: string
  name: string | null
  t: string
}

export const loadProfile = async () => {
  return await getgotRequest<ProfileResponse>("profile")
}

export const logout = async () => {}
