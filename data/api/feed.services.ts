import { GetGotSuccessResponse } from "./getgotRequest"
import { FEED_DATA, COMMENTS_DATA, USER_FEED_DATA } from "./feed.services.mockData"

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

/********************
 * Feed
 */

export interface FeedResponse extends GetGotSuccessResponse {
  results: PostType[]
}

export const loadFeed = async (pageSize?: number, searchText?: string, lastPostId?: GUID) => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<FeedResponse>("getFeed", { pageSize, searchText, lastPostId })
  return new Promise<FeedResponse>((resolve) => {
    setTimeout(resolve, 100, FEED_DATA)
  })
}

/********************
 * User Feed
 */

export type UserFeedType = {
  user: ProfileType
  feed: PostType[]
}

export interface UserFeedResponse extends GetGotSuccessResponse {
  result: UserFeedType
}

export const loadUserFeed = async (
  userId: GUID,
  pageSize?: number,
  searchText?: string,
  lastPostId?: GUID
) => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<UserFeedResponse>("getUserFeed", { userId, pageSize, searchText, lastPostId })
  return new Promise<UserFeedResponse>((resolve) => {
    setTimeout(resolve, 100, USER_FEED_DATA)
  })
}

/********************
 * Comments
 */

export interface CommentsResponse extends GetGotSuccessResponse {
  results: CommentType[]
}

export const loadComments = async (postId: GUID, pageSize?: number, lastCommentId?: GUID) => {
  // TODO: update with the final api function name and remove mock Promise
  // return await getgotRequest<CommentsResponse>("getComments", { postId, pageSize, lastCommentId })
  return new Promise<CommentsResponse>((resolve) => {
    setTimeout(resolve, 100, COMMENTS_DATA)
  })
}
