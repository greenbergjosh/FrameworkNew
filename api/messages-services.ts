import { GetGotSuccessResponse } from "api"
import { contacts, messages } from "./messages-services.mockData"
import { IMessage } from "react-native-gifted-chat"

/********************
 * Messages
 */

export type Message = {
  id: GUID
  name: string
  users: UserType[]
  messageDate: ISO8601String
  content: string
}

export type MessageThreadItem = IMessage

export interface MessagesResponse extends GetGotSuccessResponse {
  results: Message[]
}

export const loadMessages = async () => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<MessagesResponse>("getmessages", {})
  return new Promise<MessagesResponse>((resolve) => {
    setTimeout(resolve, 100, messages)
  })
}

/********************
 * Contacts
 */

export type Contact = UserType & {
  id: number
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
    setTimeout(resolve, 100, contacts)
  })
}
