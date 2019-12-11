import React from "react"
import { FlatList, ScrollView, Text } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { ActivityIndicator, Tabs } from "@ant-design/react-native"
import { HeaderTitle } from "components/HeaderTitle"
import { PromotionExpander } from "screens/main/promotions/components/PromotionExpander"
import { usePromotionsContext } from "providers/promotions-context-provider"
import { Colors, routes, styles, Units, FontWeights } from "constants"
import { Badge } from "components/Badge"
import { H4 } from "components/Markup"

export interface PromotionsScreenProps extends NavigationTabScreenProps {}

function TabTitle({ title, count, active = false }) {
  const textStyle = {
    fontWeight: active ? FontWeights.bold : FontWeights.regular,
  }
  return (
    <>
      <H4 style={[styles.LinkText, textStyle]}>{title}</H4>
      <Badge text={count} style={{ marginLeft: Units.padding / 2 }} />
    </>
  )
}

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

  let initialPage = 0
  switch (props.navigation.state.routeName) {
    case routes.Promotions.Promotions:
      initialPage = 0
      break
    case routes.Promotions.PromotionsArchived:
      initialPage = 1
      break
  }

  return (
    <Tabs
      initialPage={initialPage}
      swipeable={false}
      tabs={[
        {
          title: <TabTitle title="Current" count={promotions.length} />,
        },
        { title: <TabTitle title="Archived" count={promotions.length} /> },
      ]}>
      <ScrollView style={{ backgroundColor: Colors.screenBackground }}>
        <FlatList
          data={promotions}
          renderItem={({ item }) => <PromotionExpander navigate={navigate} promotion={item} />}
          keyExtractor={(promotion) => promotion.id}
        />
      </ScrollView>
      <ScrollView style={{ backgroundColor: Colors.screenBackground }}>
        <FlatList
          data={promotions}
          renderItem={({ item }) => <PromotionExpander navigate={navigate} promotion={item} isArchived />}
          keyExtractor={(promotion) => promotion.id}
        />
      </ScrollView>
    </Tabs>
  )
}

PromotionsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderTitle title="Promotions" align="left" size="large" />,
  }
}
