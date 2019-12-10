import { ActivityIndicator } from "@ant-design/react-native"
import { PromotionExpander } from "screens/main/promotions/components/PromotionExpander"
import { usePromotionsContext } from "providers/promotions-context-provider"
import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"

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

  return (
    <PromotionExpander key={promotionId} alwaysExpanded navigate={navigate} promotion={promotion} />
  )
}

PromotionsCampaignListScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderTitle title="Campaigns" offset="left" />,
  }
}
