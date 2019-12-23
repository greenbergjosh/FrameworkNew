import { GetGotSuccessResponse } from "api"
import { contacts, messages } from "./messages-services.mockData"

/********************
 * Messages
 */

export type Message = {
  id: GUID
  name: string
  users: UserInfoType[]
  messageDate: ISO8601String
  content: string
}

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

export type Contact = UserInfoType & {
  id: number
  name: string
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
