import { ImageUris, Images } from "constants"
import { FeedResponse, CommentsResponse } from "./feed.services"


let id = 1
const guid = () => `guid-${id++}`

export const COMMENTS_DATA: CommentsResponse = {
  r: 0,
  results: [
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
      liked: true,
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
    {
      id: "69368e0c-5383-471e-b075-000000000007",
      user: {
        userId: "69368e0c-5383-471e-b075-3272b4923751",
        handle: "jupiterdollies",
        avatarUri: ImageUris.placeholder,
      },
      message: "yet another comment",
      likes: { count: 0 },
      comments: [],
    },
  ]
}

export const FEED_COMMENTS: CommentsType = {
  lastActivity: "2019-11-26T15:04:44.477Z",
  enabled: true,
  likes: {
    count: 78,
    firstUser: {
      userId: "69368e0c-5383-471e-b075-3272b4922750",
      handle: "groovy.dollies",
      avatarUri: "https://randomuser.me/api/portraits/women/2.jpg",
    },
  },
  comments: COMMENTS_DATA.results,
}

export const FEED_DATA: FeedResponse = {
  r: 0,
  results: [
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db01",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/1/435/435" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db01",
        dimensions: { width: 435, height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "loren",
        avatarUri:
          "https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=b616b2c5b373a80ffc9636ba24f7a4a9",
      },
      liked: true,
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db02",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/2/300/300" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db02",
        dimensions: { width: 300, height: 300 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: "https://randomuser.me/api/portraits/women/6.jpg",
      },
      comments: {...FEED_COMMENTS, enabled: false},
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db03",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/3/435/320" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db03",
        dimensions: { width: 435, height: 320 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "snoren",
        avatarUri: "https://randomuser.me/api/portraits/women/7.jpg",
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db04",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/4/300/250" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db04",
        dimensions: { width: 300, height: 250 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db05",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/5/400/400" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db05",
        dimensions: { width: 400, height: 400 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db06",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/6/435/435" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db06",
        dimensions: { width: 435, height: 435 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db07",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/7/300/300" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db07",
        dimensions: { width: 300, height: 300 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db08",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: {
        source: { uri: "https://picsum.photos/seed/8/360/360" },
        id: "e8e91d07-9824-4ef0-8944-66eb7cd9db08",
        dimensions: { width: 360, height: 360 },
      },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db09",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db10",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db11",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db12",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db13",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db14",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db15",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db16",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db17",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db18",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db19",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db20",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db21",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db22",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db23",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db24",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db25",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db26",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db27",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
    {
      id: "c9568bdf-dec9-4a78-802c-66eb7cd9db28",
      promotionId: "1680cacc-17d1-46ee-a1fa-1c90d65d6f2d",
      campaignId: "026812ff-7046-4650-9e18-c9893c354b11",
      image: { ...Images.placeholder, id: guid() },
      user: {
        userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb55",
        handle: "boren",
        avatarUri: ImageUris.placeholder,
      },
      comments: FEED_COMMENTS,
    },
  ],
}

export const INFLUENCER_PROFILE_DATA: ProfileType = {
  userId: "a7d1a061-24bc-405e-a5e0-adeb88dceb52",
  handle: "loren",
  avatarUri: "https://randomuser.me/api/portraits/women/43.jpg",
  topInfluencer: true,
  postsCount: 1185,
  followersCount: 17000000,
  followingCount: 225,
  bio: "✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧",
  bioLink: new URL("youtu.be/Emkxvx11nz4"),
  followerSample: ["agplace", "agpretzels", "brookeeelizbeth"],
}

export const USER_FEED_DATA: { user: ProfileType; feed: PostType[] } = {
  user: INFLUENCER_PROFILE_DATA,
  feed: FEED_DATA.results,
}
