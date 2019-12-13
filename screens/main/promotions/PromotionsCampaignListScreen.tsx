import { ActivityIndicator } from "@ant-design/react-native"
import { PromotionExpander } from "screens/main/promotions/components/PromotionExpander"
import { usePromotionsContext } from "providers/promotions-context-provider"
import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Tab, Tabs } from "../../../components/Tabs"
import { Colors, routes } from "constants"
import { ScrollView } from "react-native"
import { PromotionCard } from "./components/PromotionCard"
import { CampaignsList } from "./components/CampaignsList"

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
  const campaigns = promotionsContext.campaignsByPromotion[promotion.id]
  if (!promotion) {
    // TODO: Should probably have a single promotion load service
    promotionsContext.loadPromotions()
    promotionsContext.loadPromotionCampaigns(promotion.id)
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  return (
    <>
      <PromotionCard
        promotional={promotion.payload}
        promotionId={promotion.id}
        expires={promotion.expires}
        isArchived={false}
        campaignCount={2}
        navigate={navigate}
      />
      <Tabs stateRouteName={props.navigation.state.routeName} swipeEnabled={false}>
        <Tab title="Active" route={routes.Promotions.Promotions} badge={4}>
          <ScrollView style={{ backgroundColor: Colors.screenBackground }}>
            <CampaignsList
              campaigns={campaigns}
              promotion={promotion}
              alwaysExpanded={true}
              navigate={navigate}
            />
          </ScrollView>
        </Tab>
        <Tab title="Expired" route={routes.Promotions.PromotionsArchived} badge={4}>
          <ScrollView style={{ backgroundColor: Colors.screenBackground }}>
            <CampaignsList
              campaigns={campaigns}
              promotion={promotion}
              alwaysExpanded={true}
              navigate={navigate}
            />
          </ScrollView>
        </Tab>
      </Tabs>
    </>
  )
}

PromotionsCampaignListScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: null,
    headerTitle: () => <HeaderTitle title="Campaigns" offset="left" />,
  }
}
