import { getgotRequest, GetGotSuccessResponse } from "./getgotRequest"
import { SID } from "constants/appkeys"

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

export const submitCode = async (contact: string, code: string) => {
  return await getgotRequest<SubmitCodeResponse>("submitcnfmcode", { u: contact, code })
}

/********************
 * Create User
 */

//TODO: this model should be of type UserType
export interface CreateUserResponse extends GetGotSuccessResponse {
  name: string
  email: string
  handle: string
  imageurl: string
  h: string
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
    SID
  )
}
