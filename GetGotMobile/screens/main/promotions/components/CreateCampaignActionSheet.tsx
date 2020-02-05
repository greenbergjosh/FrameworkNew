import { ActionSheet } from "@ant-design/react-native"
import { routes } from "constants"

export const showCreateCampaignActionSheet = (promotionId: GUID, navigate) => {
  ActionSheet.showActionSheetWithOptions(
    {
      title: "Is this campaign to get a gift or to sell?",
      options: ["For You", "For Me", "Cancel"],
      cancelButtonIndex: 2,
    },
    (buttonIndex) =>
      buttonIndex < 2 ? navigate(routes.Promotions.CampaignTemplates, { promotionId }) : null
  )
}