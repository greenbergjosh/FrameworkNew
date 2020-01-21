import { GetGotSuccessResponse } from "./getgotRequest"
import { CONTACTS_MOCK_DATA, MESSAGES_MOCK_DATA } from "./messages.services.mockData"
import { IMessage } from "react-native-gifted-chat"

/********************
 * Messages
 */

export type MessageSummary = {
  id: GUID
  name: string
  users: UserType[]
  messageDate: ISO8601String
  content: string
}

export type MessageThreadItem = IMessage

export type Message = {
  id: GUID
  title: string
  participants: string[]
  thread: MessageThreadItem[]
}

export interface MessagesResponse extends GetGotSuccessResponse {
  results: MessageSummary[]
}

export const loadMessages = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<MessagesResponse>("getmessages", {})
  return new Promise<MessagesResponse>((resolve) => {
    setTimeout(resolve, 100, MESSAGES_MOCK_DATA)
  })
}

/********************
 * Contacts
 */

export type Contact = UserType & {
  id: GUID
  contactDate: ISO8601String
  content: string
}

export interface ContactsResponse extends GetGotSuccessResponse {
  results: Contact[]
}

export const loadContacts = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<ContactsResponse>("getcontacts", {})
  return new Promise<ContactsResponse>((resolve) => {
    setTimeout(resolve, 100, CONTACTS_MOCK_DATA)
  })
}
