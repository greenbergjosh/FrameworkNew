import { getgotRequest, GetGotSuccessResponse } from "./index"

export interface FeedResponse extends GetGotSuccessResponse {}

export type LikesType = {
  count: number
  firstUser?: UserInfoType
}

export type CommentType = {
  id
  user: UserInfoType
  message: string
  likes: LikesType
  comments: CommentType[]
}

export type FeedCommentType = {
  lastActivity: ISO8601String
  likes: LikesType
  comments: CommentType[]
}

export type FeedItemType = {
  id: GUID
  image: ImageType
  user?: UserInfoType
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