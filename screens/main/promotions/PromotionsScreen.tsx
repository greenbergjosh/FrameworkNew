import {
  ActivityIndicator,
  Button,
  List,
  Toast
  } from "@ant-design/react-native"
import React from "react"
import { ScrollView } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "../../../components/HeaderTitle"
import { PromotionRow } from "../../../components/promotions/PromotionRow"
import { usePromotionsContext } from "../../../providers/promotions-context-provider"

export interface PromotionsScreenProps extends NavigationTabScreenProps {}

export const PromotionsScreen = (props: PromotionsScreenProps) => {
  const promotionsContext = usePromotionsContext()

  if (!promotionsContext.lastLoadPromotions) {
    promotionsContext.loadPromotions()
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  const promotions = promotionsContext.results

  const { navigate } = props.navigation
  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: "#f5f5f9" }}
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <List>
          {promotions.map((promotion) => (
            <PromotionRow
              key={promotion.id}
              campaigns={promotionsContext.campaignsByPromotion[promotion.id] || []}
              navigate={navigate}
              onExpand={() =>
                // If there's no data
                !promotionsContext.campaignsByPromotion[promotion.id] &&
                // Load the campaigns for this promotion
                promotionsContext.loadPromotionCampaigns(promotion.id)
              }
              promotion={promotion}
            />
          ))}
        </List>
      </ScrollView>

      <Button onPress={() => Toast.info("This is a Promotions toast")}>
        Show Promotions Toast
      </Button>
      <Button onPress={() => navigate("PromotionsCampaignList")}>Jump to Single Promotion</Button>
      <Button onPress={() => navigate("PromotionsCampaign", { draft: true })}>
        Jump to Single Campaign (Draft)
      </Button>
      <Button onPress={() => navigate("PromotionsCampaign")}>
        Jump to Single Campaign (Published)
      </Button>
    </>
  )
}

PromotionsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderTitle title="Promotions" align="left" size="large" />,
  }
}
