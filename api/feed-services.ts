import { getgotRequest, GetGotSuccessResponse } from "./index"

export interface FeedResponse extends GetGotSuccessResponse {}

export const loadHomeFeed = async (
  pageSize?: number,
  searchText?: string,
  lastCampaignId?: string
) => {
  return await getgotRequest<FeedResponse>("getFeed", { pageSize, searchText, lastCampaignId })
}
