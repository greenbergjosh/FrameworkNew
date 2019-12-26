import { ContactsResponse, MessagesResponse, MessageThreadItem } from "./messages-services"

export const messages: MessagesResponse = {
  r: 0,
  results: [
    {
      id: "e07001e5-39a6-47a4-8232-d8b1b81b4a5a",
      name: "Message Name",
      users: [
        {
          userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
          avatarUri: "https://randomuser.me/api/portraits/women/43.jpg",
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
          avatarUri: "https://randomuser.me/api/portraits/women/44.jpg",
          handle: "itsdyasia",
        },
        {
          userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
          avatarUri: "https://randomuser.me/api/portraits/women/45.jpg",
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
          avatarUri: "https://randomuser.me/api/portraits/women/46.jpg",
          handle: "idk_just_stan_bts",
        },
      ],
      messageDate: "2019-11-11T07:00:00+12:00",
      content:
        "This is the message. This is the message. This is the message. This is the message. ",
    },
  ],
}

export const messageThread: MessageThreadItem[] = [
  {
    _id: 1,
    text: "What are you feeling like?",
    createdAt: new Date(),
    user: {
      _id: 2,
      name: "React Native",
      avatar: "https://randomuser.me/api/portraits/women/30.jpg",
    },
  },
  {
    _id: 2,
    text: "Yeah, let's go somewhere soon",
    createdAt: new Date(),
    user: {
      _id: 1,
      name: "React Native",
      avatar:
        "https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=b616b2c5b373a80ffc9636ba24f7a4a9",
    },
  },
  {
    _id: 3,
    text: "Are you getting hungry? Wanna go somewhere?",
    createdAt: new Date(),
    user: {
      _id: 2,
      name: "React Native",
      avatar: "https://randomuser.me/api/portraits/women/30.jpg",
    },
  },
]

export const contacts: ContactsResponse = {
  r: 0,
  results: [
    {
      id: 1,
      userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
      avatarUri: "https://randomuser.me/api/portraits/women/40.jpg",
      handle: "erynearly",
      name: "Contact Name",
      contactDate: "2019-11-25T07:00:00+12:00",
      content:
        "This is the contact. This is the contact. This is the contact. This is the contact. ",
    },
    {
      id: 2,
      userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
      avatarUri: "https://randomuser.me/api/portraits/women/41.jpg",
      handle: "itsdyasia",
      name: "Contact Name",
      contactDate: "2019-11-24T07:00:00+12:00",
      content:
        "This is the contact. This is the contact. This is the contact. This is the contact. ",
    },
    {
      id: 3,
      userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
      avatarUri: "https://randomuser.me/api/portraits/women/42.jpg",
      handle: "idk_just_stan_bts",
      name: "Contact Name",
      contactDate: "2019-11-11T07:00:00+12:00",
      content:
        "This is the contact. This is the contact. This is the contact. This is the contact. ",
    },
  ],
}
