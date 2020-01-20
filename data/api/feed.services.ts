import { getgotRequest, GetGotSuccessResponse } from "./getgotRequest"

export type PostType = {
  id: GUID
  image: ImageType
  user?: UserType
  promotionId: GUID
  campaignId: GUID
  liked?: boolean
  comments: CommentsType
}

/**
 * TODO: APIPostType should be changed to be PostType
 * This is the interface provided by the API but it is lacking necessary properties.
 */
export type APIPostType = {
  uri: string
  id: number
  height?: number
  user?: UserType
}

export interface FeedResponse extends GetGotSuccessResponse {
  results: APIPostType[]
}

export type LikesType = {
  count: number
  firstUser?: UserType
}

export type CommentType = {
  id
  user: UserType
  message: string
  liked?: boolean
  likes: LikesType
  comments: CommentType[]
}

export type CommentsType = {
  lastActivity: ISO8601String
  likes: LikesType
  comments: CommentType[]
  enabled: boolean
}

export const loadHomeFeed = async (
  pageSize?: number,
  searchText?: string,
  lastCampaignId?: string
) => {
  return await getgotRequest<FeedResponse>("getFeed", { pageSize, searchText, lastCampaignId })
}
