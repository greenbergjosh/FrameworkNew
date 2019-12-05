export type SettingType = {
  id: GUID
  title: string
  description: string
  checked: boolean
}

export const PRIVACYOPTIONS_DATA: SettingType[] = [
  {
    id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
    title: "Let others find me by email address",
    description: "People who have your email address will be able to connect with you on GetGot.",
    checked: true,
  },
  {
    id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
    title: "Let others find me by phone number",
    description: "People who have your phone number will be able to connect with you on GetGot.",
    checked: true,
  },
  {
    id: "58694a0f-3da1-471f-bd96-145571e29d72",
    title: "Anyone can follow",
    description:
      "People who follow you can immediately see your feed. When disabled, you must approve each follow request.",
    checked: false,
  },
]

export const NOTIFICATIONS_DATA: SettingType[] = [
  {
    id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
    title: "Likes",
    description: "",
    checked: true,
  },
  {
    id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
    title: "Likes and Comments on Photos of You",
    description: "",
    checked: true,
  },
  {
    id: "58694a0f-3da1-471f-bd96-145571e29d72",
    title: "Photos of You",
    description: "",
    checked: false,
  },
  {
    id: "58694a0f-3da1-471f-bd96-145571e29d73",
    title: "Comments",
    description: "",
    checked: false,
  },
  {
    id: "58694a0f-3da1-471f-bd96-145571e29d74",
    title: "Comment Likes",
    description: "",
    checked: false,
  },
  {
    id: "58694a0f-3da1-471f-bd96-145571e29d75",
    title: "First Posts",
    description: "",
    checked: false,
  },
]
