import { ContactsResponse, ChatsResponse, ChatType } from "./messages"

export const CHATS_MOCK_DATA: ChatsResponse = {
  r: 0,
  results: [
    {
      id: "e07001e5-39a6-47a4-8232-d8b1b81b4a5a",
      title: "Chat Title 1",
      users: [
        {
          userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
          avatarUri: "https://randomuser.me/api/portraits/women/43.jpg",
          handle: "erynearly",
        },
      ],
      lastMessageDate: "2019-11-25T07:00:00+12:00",
    },
    {
      id: "fd73f05a-4f64-4743-9eec-856ca36f550c",
      title: "Chat Title 2",
      users: [
        {
          userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
          avatarUri: "https://randomuser.me/api/portraits/women/44.jpg",
          handle: "itsdyasia",
        },
        {
          userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
          avatarUri: "https://randomuser.me/api/portraits/women/46.jpg",
          handle: "idk_just_stan_bts",
        },
      ],
      lastMessageDate: "2019-11-24T07:00:00+12:00",
    },
    {
      id: "1cf44754-f0f1-499b-90ee-ca3d414992a7",
      title: "Chat Title 3",
      users: [
        {
          userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
          avatarUri: "https://randomuser.me/api/portraits/women/46.jpg",
          handle: "idk_just_stan_bts",
        },
      ],
      lastMessageDate: "2019-11-11T07:00:00+12:00",
    },
  ],
}

export const CHAT_MOCK_DATA: ChatType = {
  id: "09564766-81d8-44bd-816e-1d7fd3abbdc7",
  title: "Lunch plans?",
  users: [
    {
      userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
      avatarUri: "https://randomuser.me/api/portraits/women/46.jpg",
      handle: "loren",
    },
  ],
  lastMessageDate: "2019-11-25T07:00:00+12:00",
  messages: [
    {
      _id: 1,
      text: "What are you feeling like?",
      createdAt: new Date(),
      user: {
        _id: 2,
        name: "Person 2",
        avatar: "https://randomuser.me/api/portraits/women/30.jpg",
      },
    },
    {
      _id: 2,
      text: "Yeah, let's go somewhere soon",
      createdAt: new Date(),
      user: {
        _id: 1,
        name: "loren",
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
        name: "Person 2",
        avatar: "https://randomuser.me/api/portraits/women/30.jpg",
      },
    },
  ],
}

export const CONTACTS_MOCK_DATA: ContactsResponse = {
  r: 0,
  results: [
    {
      userId: "0de8d8f1-281f-4652-a49c-47ef33e5c59d",
      avatarUri: "https://randomuser.me/api/portraits/women/40.jpg",
      handle: "erynearly",
      name: "Contact Name",
    },
    {
      userId: "8568ffe3-6346-4486-b1d0-be843dcaac25",
      avatarUri: "https://randomuser.me/api/portraits/women/41.jpg",
      handle: "itsdyasia",
      name: "Contact Name",
    },
    {
      userId: "37c240b4-b18c-4239-90ca-fea6b10167b0",
      avatarUri: "https://randomuser.me/api/portraits/women/42.jpg",
      handle: "idk_just_stan_bts",
      name: "Contact Name",
    },
  ],
}
