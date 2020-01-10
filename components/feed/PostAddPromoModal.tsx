import { Alert } from "react-native"
import { routes } from "constants"
import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"

interface PostAddPromoProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  promotionId: GUID
}

export const showPostAddPromoModal = ({ navigate, promotionId }: PostAddPromoProps) => {
  Alert.alert(
    "Start a Campaign?",
    "You added a new item to promote. Do you want to start a campaign?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () =>
          navigate(routes.Promotions.CampaignTemplates, {
            promotionId,
          }),
      },
    ]
  )
}
