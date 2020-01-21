import { SettingType, ProfileResponse } from "./profile.services"

export const PROFILE_MOCK_DATA: ProfileResponse = {
  r: 0,
  result: {
    userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb52",
    handle: "sara.h",
    name: "Sara Hoeckman",
    contact: { email: "sara.h@yahoo.com", phone: "+18885551212" },
    gender: "F",
    dob: "1993-11-26T12:04:44.477Z",
    avatarUri:
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=b616b2c5b373a80ffc9636ba24f7a4a9",
    postsCount: 1185,
    followersCount: 17000000,
    followingCount: 225,
    bio: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
    bioLink: new URL("youtu.be/Emkxvx11nz4"),
    followerSample: ["agplace", "agpretzels", "brookeeelizbeth"],
  },
}

export const ANALYTICS_MOCK_DATA = {
  impressionsCount: 2526,
  clickThruCount: 396,
  itemsSoldCount: 52,
  commissionTotal: 126,
  reach: 139,
}

export const PRIVACYOPTIONS_MOCK_DATA: SettingType[] = [
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

export const NOTIFICATIONS_MOCK_DATA: SettingType[] = [
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
