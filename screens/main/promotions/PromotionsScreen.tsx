import React from "react"
import { FlatList, ScrollView } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { ActivityIndicator } from "@ant-design/react-native"
import { HeaderTitle } from "components/HeaderTitle"
import { PromotionExpander } from "screens/main/promotions/components/PromotionExpander"
import { usePromotionsContext } from "providers/promotions-context-provider"
import { Colors } from "constants"

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
    <ScrollView style={{ backgroundColor: Colors.screenBackground }}>
      <FlatList
        data={promotions}
        renderItem={({ item }) => <PromotionExpander navigate={navigate} promotion={item} />}
        keyExtractor={(promotion) => promotion.id}
      />
    </ScrollView>
  )
}

PromotionsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderTitle title="Promotions" align="left" size="large" />,
  }
}
