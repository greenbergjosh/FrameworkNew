import { GetGotSuccessResponse } from "./getgotRequest"
import { CONTACTS_MOCK_DATA, CHATS_MOCK_DATA } from "./messages.mockData"
import { IMessage } from "react-native-gifted-chat"

/********************
 * Types
 */

export type ChatType = {
  id: GUID
  title: string
  users: UserType[]
  lastMessageDate: ISO8601String
  messages?: IMessage[]
}

/********************
 * Chats
 */

export interface ChatsResponse extends GetGotSuccessResponse {
  results: ChatType[]
}

export const loadChats = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<MessagesResponse>("getmessages", {})
  return new Promise<ChatsResponse>((resolve) => {
    setTimeout(resolve, 100, CHATS_MOCK_DATA)
  })
}

/********************
 * Contacts
 */

export interface ContactsResponse extends GetGotSuccessResponse {
  results: UserType[]
}

export const loadContacts = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<ContactsResponse>("getcontacts", {})
  return new Promise<ContactsResponse>((resolve) => {
    setTimeout(resolve, 100, CONTACTS_MOCK_DATA)
  })
}
