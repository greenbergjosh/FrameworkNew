import { getgotRequest, GetGotSuccessResponse } from "./index"

export type PostType = {
  uri: string
  id: number
  height?: number
  user?: UserType
}

export interface FeedResponse extends GetGotSuccessResponse {
  results: PostType[]
}

export type LikesType = {
  count: number
  firstUser?: UserType
}

export type CommentType = {
  id
  user: UserType
  message: string
  likes: LikesType
  comments: CommentType[]
}

export type PostCommentType = {
  lastActivity: ISO8601String
  likes: LikesType
  comments: CommentType[]
}

export type CampaignPostType = {
  id: GUID
  image: ImageType
  user?: UserType
  promotionId: GUID
  campaignId: GUID
}

export const loadHomeFeed = async (
  pageSize?: number,
  searchText?: string,
  lastCampaignId?: string
) => {
  return await getgotRequest<FeedResponse>("getFeed", { pageSize, searchText, lastCampaignId })
}