import { getgotRequest, GetGotSuccessResponse } from "./index"

export interface FeedResponse extends GetGotSuccessResponse {}

export type FeedItemType = {
  id: GUID,
  image: ImageType,
  user?: UserInfoType,
  promotionId: GUID,
  campaignId: GUID,
}

export const loadHomeFeed = async (
  pageSize?: number,
  searchText?: string,
  lastCampaignId?: string
) => {
  return await getgotRequest<FeedResponse>("getFeed", { pageSize, searchText, lastCampaignId })
}
