import { GetGotSuccessResponse, getgotRequest } from "./index"

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
  return await getgotRequest<SubmitCodeResponse>("submitcnfmcode", { u: contact, code })
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
