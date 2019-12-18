import { getgotRequest, GetGotSuccessResponse } from "./index"

export type FeedItemType = {
  uri: string
  id: number
  height?: number
  user?: UserInfoType
}

export type UserInfoType = {
  userId: number
  handle: string
  avatarUri: string
}

export interface FeedResponse extends GetGotSuccessResponse {
  results: FeedItemType[]
}

export const loadHomeFeed = async (
  pageSize?: number,
  searchText?: string,
  lastCampaignId?: string
) => {
  return await getgotRequest<FeedResponse>("getFeed", { pageSize, searchText, lastCampaignId })
}
