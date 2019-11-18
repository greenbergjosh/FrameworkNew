import { getgotRequest, GetGotSuccessResponse } from "./index"

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
  console.log('synccontacts!')
  return await getgotRequest<SyncContactsResponse>("synccontacts", { contacts })
}
