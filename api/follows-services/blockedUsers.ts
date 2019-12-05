import { ImageUris } from "constants"
import { GetGotSuccessResponse } from "api"

/************************************************************
 * BlockedUsers
 */

export type BlockedUser = {
  id: number
  userId: GUID
  avatarUri: string
  handle: string
  name: string
  blockedDate: ISO8601String
}

// TODO: Fetch this from the API
export const blockedUsers: BlockedUsersResponse = {
  r: 0,
  results: [
    {
      id: 1,
      userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
      avatarUri: ImageUris.placeholder,
      handle: "erynearly",
      name: "Blocked User Name",
      blockedDate: "2019-11-25T07:00:00+12:00",
    },
    {
      id: 2,
      userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
      avatarUri: ImageUris.placeholder,
      handle: "itsdyasia",
      name: "Blocked User Name",
      blockedDate: "2019-11-24T07:00:00+12:00",
    },
    {
      id: 3,
      userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
      avatarUri: ImageUris.placeholder,
      handle: "idk_just_stan_bts",
      name: "Blocked User Name",
      blockedDate: "2019-11-11T07:00:00+12:00",
    },
  ],
}

export interface BlockedUsersResponse extends GetGotSuccessResponse {
  results: BlockedUser[]
}

export const loadBlockedUsers = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<BlockedUsersResponse>("getblockedusers", {})
  return new Promise<BlockedUsersResponse>((resolve) => {
    setTimeout(resolve, 100, blockedUsers)
  })
}
