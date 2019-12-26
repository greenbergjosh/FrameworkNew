import { getgotRequest, GetGotSuccessResponse } from "./index"
import { UserInfoType } from "./profile-services"

export type FeedItemType = {
  uri: string
  id: number
  height?: number
  user?: UserInfoType
}

export interface FeedResponse extends GetGotSuccessResponse {
  results: FeedItemType[]
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

export type PostType = {
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