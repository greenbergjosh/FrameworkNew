import { ImageUris } from "constants"
import { PostCommentType, PostType } from "./feed-services"

export const FEED_DATA: { feed: PostType[] } = {
  feed: [
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db01",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/1/435/435" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db01",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "loren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db02",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/2/300/300" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db02",
        dimensions: { height: 300 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db03",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/3/435/320" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db03",
        dimensions: { height: 320 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "snoren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db04",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/4/300/250" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db04",
        dimensions: { height: 250 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db05",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/5/400/400" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db05",
        dimensions: { height: 400 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db06",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/6/435/435" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db06",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db07",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/7/300/300" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db07",
        dimensions: { height: 300 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db08",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/8/360/360" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db08",
        dimensions: { height: 360 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db09",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db09",
        dimensions: { height: 400 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db10",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db10",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db11",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db11",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db12",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db12",
        dimensions: { height: 279 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db13",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db13",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db14",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db14",
        dimensions: { height: 200 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db15",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db15",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db16",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db16",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db17",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db17",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db18",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db18",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db19",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db19",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db20",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db20",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db21",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db21",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db22",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db22",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db23",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db23",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db24",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db24",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db25",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db25",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db26",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db26",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db27",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: ImageUris.placeholder },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db27",
        dimensions: { height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
    },
  ],
}

export const INFLUENCER_PROFILE_DATA: UserProfileType = {
  userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb52",
  handle: "loren",
  avatarUri: ImageUris.placeholder,
  postsCount: 1185,
  followersCount: 17000000,
  followingCount: 225,
  bio: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
  bioLink: new URL("youtu.be/Emkxvx11nz4"),
  followerSample: ["agplace", "agpretzels", "brookeeelizbeth"],
}

export const USER_FEED_DATA: { user: UserProfileType; feed: PostType[] } = {
  user: INFLUENCER_PROFILE_DATA,
  feed: FEED_DATA.feed,
}

export const FEED_COMMENTS: PostCommentType = {
  lastActivity: "2019-11-26T15:04:44.477Z",
  likes: {
    count: 78,
    firstUser: {
      userId: "69368e0c-5383-471e-b075-3272b4922750",
      handle: "groovy.dollies",
      avatarUri: ImageUris.placeholder,
    },
  },
  comments: [
    {
      id: "69368e0c-5383-471e-b075-000000000001",
      user: {
        userId: "69368e0c-5383-471e-b075-3272b4922751",
        handle: "jupiterdollies",
        avatarUri: ImageUris.placeholder,
      },
      message: "margo🦋",
      likes: { count: 0 },
      comments: [
        {
          id: "69368e0c-5383-471e-b075-000000000002",
          user: {
            userId: "69368e0c-5383-471e-b075-3272b4922751",
            handle: "userhandle1",
            avatarUri: ImageUris.placeholder,
          },
          message: "Yet another comment 1",
          likes: { count: 0 },
          comments: [],
        },
        {
          id: "69368e0c-5383-471e-b075-000000000003",
          user: {
            userId: "69368e0c-5383-471e-b075-3272b4922752",
            handle: "userhandle2",
            avatarUri: ImageUris.placeholder,
          },
          message: "Yet another comment 2",
          likes: { count: 0 },
          comments: [],
        },
        {
          id: "69368e0c-5383-471e-b075-000000000004",
          user: {
            userId: "69368e0c-5383-471e-b075-3272b4922753",
            handle: "userhandle3",
            avatarUri: ImageUris.placeholder,
          },
          message: "Yet another comment 3",
          likes: { count: 0 },
          comments: [],
        },
      ],
    },
    {
      id: "69368e0c-5383-471e-b075-000000000005",
      user: {
        userId: "69368e0c-5383-471e-b075-3272b4922754",
        handle: "agafrica254",
        avatarUri: ImageUris.placeholder,
      },
      message: "Cutie😍😍",
      likes: { count: 0 },
      comments: [],
    },
    {
      id: "69368e0c-5383-471e-b075-000000000006",
      user: {
        userId: "69368e0c-5383-471e-b075-3272b4922751",
        handle: "jupiterdollies",
        avatarUri: ImageUris.placeholder,
      },
      message: "@agafrica254 thank you💓 for that lovely comment!",
      likes: { count: 0 },
      comments: [],
    },
  ],
}
