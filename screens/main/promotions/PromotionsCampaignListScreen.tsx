import {
  ActivityIndicator,
  Button,
  Icon,
  List,
  WhiteSpace
  } from "@ant-design/react-native"
import { PromotionRow } from "components/promotions/PromotionRow"
import { usePromotionsContext } from "providers/promotions-context-provider"
import React from "react"
import { Image, Text, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "../../../components/HeaderTitle"

interface PromotionsCampaignListParams {
  promotionId: GUID
}

interface PromotionsCampaignListScreenProps
  extends NavigationTabScreenProps<PromotionsCampaignListParams> {}

export const PromotionsCampaignListScreen = (props: PromotionsCampaignListScreenProps) => {
  const {
    navigate,
    state: {
      params: { promotionId },
    },
  } = props.navigation
  const promotionsContext = usePromotionsContext()

  const promotion = promotionsContext.promotionsById[promotionId]
  if (!promotion) {
    // TODO: Should probably have a single promotion load service
    promotionsContext.loadPromotions()
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  const campaigns = promotionsContext.campaignsByPromotion[promotionId]

  React.useEffect(() => {
    if (!campaigns) {
      promotionsContext.loadPromotionCampaigns(promotionId)
    }
  }, [campaigns])

  return (
    <PromotionRow
      key={promotionId}
      alwaysExpanded
      campaigns={campaigns || []}
      navigate={navigate}
      promotion={promotion}
    />
  )
}

PromotionsCampaignListScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderTitle title="Campaigns" offset="left" />,
  }
}
