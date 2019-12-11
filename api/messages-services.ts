import { ImageUris } from "constants"
import { GetGotSuccessResponse } from "api"

/************************************************************
 * Messages
 */

export type User = {
  userId: GUID
  avatarUri: string
  handle: string
}

export type Message = {
  id: GUID
  name: string
  users: User[]
  messageDate: ISO8601String
  content: string
}

// TODO: Fetch this from the API
export const messages: MessagesResponse = {
  r: 0,
  results: [
    {
      id: "e07001e5-39a6-47a4-8232-d8b1b81b4a5a",
      name: "Message Name",
      users: [
        {
          userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
          avatarUri: ImageUris.placeholder,
          handle: "erynearly",
        },
      ],
      messageDate: "2019-11-25T07:00:00+12:00",
      content:
        "This is the message. This is the message. This is the message. This is the message. ",
    },
    {
      id: "fd73f05a-4f64-4743-9eec-856ca36f550c",
      name: "Message Name",
      users: [
        {
          userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
          avatarUri: ImageUris.placeholder,
          handle: "itsdyasia",
        },
        {
          userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
          avatarUri: ImageUris.placeholder,
          handle: "itsdyasia",
        },
      ],
      messageDate: "2019-11-24T07:00:00+12:00",
      content:
        "This is the message. This is the message. This is the message. This is the message. ",
    },
    {
      id: "1cf44754-f0f1-499b-90ee-ca3d414992a7",
      name: "Message Name",
      users: [
        {
          userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
          avatarUri: ImageUris.placeholder,
          handle: "idk_just_stan_bts",
        },
      ],
      messageDate: "2019-11-11T07:00:00+12:00",
      content:
        "This is the message. This is the message. This is the message. This is the message. ",
    },
  ],
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

/************************************************************
 * Contacts
 */

export type Contact = {
  id: number
  userId: GUID
  avatarUri: string
  handle: string
  name: string
  contactDate: ISO8601String
  content: string
}

// TODO: Fetch this from the API
export const contacts: ContactsResponse = {
  r: 0,
  results: [
    {
      id: 1,
      userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
      avatarUri: ImageUris.placeholder,
      handle: "erynearly",
      name: "Contact Name",
      contactDate: "2019-11-25T07:00:00+12:00",
      content:
        "This is the contact. This is the contact. This is the contact. This is the contact. ",
    },
    {
      id: 2,
      userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
      avatarUri: ImageUris.placeholder,
      handle: "itsdyasia",
      name: "Contact Name",
      contactDate: "2019-11-24T07:00:00+12:00",
      content:
        "This is the contact. This is the contact. This is the contact. This is the contact. ",
    },
    {
      id: 3,
      userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
      avatarUri: ImageUris.placeholder,
      handle: "idk_just_stan_bts",
      name: "Contact Name",
      contactDate: "2019-11-11T07:00:00+12:00",
      content:
        "This is the contact. This is the contact. This is the contact. This is the contact. ",
    },
  ],
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
