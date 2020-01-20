import { ActivityIndicator } from "@ant-design/react-native"
import { usePromotionsContext } from "data/promotions.contextProvider"
import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Tab, Tabs } from "components/Tabs"
import { Colors, routes } from "constants"
import { SafeAreaView, ScrollView } from "react-native"
import { PromotionCard } from "./components/PromotionCard"
import { CampaignsList } from "./components/CampaignsList"
import { BottomTabBar } from "components/BottomTabBar"
import NavButton from "components/NavButton"

interface CampaignListParams {
  promotionId: GUID
}

interface CampaignListScreenProps
  extends NavigationTabScreenProps<CampaignListParams> {}

export const CampaignListScreen = (props: CampaignListScreenProps) => {
  const {
    navigate,
    state: {
      params: { promotionId },
    },
  } = props.navigation
  const promotionsContext = usePromotionsContext()
  const promotion = promotionsContext.promotionsById[promotionId]
  const campaigns = promotionsContext.campaignsByPromotion[promotion.id] || []
  if (!promotion && !promotionsContext.loading.loadPromotions[JSON.stringify([])]) {
    // TODO: Should probably have a single promotion load service
    promotionsContext.loadPromotions()
    promotionsContext.loadPromotionCampaigns(promotion.id)
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
      <BottomTabBar activeTab={routes.Promotions.default} />
    </SafeAreaView>
  )
}

CampaignListScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
    headerTitle: () => <HeaderTitle title="Campaigns" offset="none" />,
  }
}
