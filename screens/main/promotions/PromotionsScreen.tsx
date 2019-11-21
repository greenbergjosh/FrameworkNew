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

  if (
    !promotionsContext.lastLoadPromotions &&
    !promotionsContext.loading.loadPromotions[JSON.stringify([])]
  ) {
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
              campaigns={promotionsContext.campaignsByPromotion[promotion.id]}
              navigate={navigate}
              loading={promotionsContext.loading.loadPromotionCampaigns[promotion.id]}
              onExpand={async () => {
                // If there's no data
                if (!promotionsContext.campaignsByPromotion[promotion.id]) {
                  // Load the campaigns for this promotion
                  await promotionsContext.loadPromotionCampaigns(promotion.id)
                }
              }}
              promotion={promotion}
            />
          ))}
        </List>
      </ScrollView>
    </>
  )
}

PromotionsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderTitle title="Promotions" align="left" size="large" />,
  }
}
