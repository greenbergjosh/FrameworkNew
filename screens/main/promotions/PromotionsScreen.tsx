import React from "react"
import { FlatList, ScrollView } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { ActivityIndicator } from "@ant-design/react-native"
import { HeaderTitle } from "components/HeaderTitle"
import { usePromotionsContext } from "providers/promotions-context-provider"
import { Colors, FontWeights, routes, styles, Units } from "constants"
import { Badge } from "components/Badge"
import { H4, P } from "components/Markup"
import { Tab, Tabs } from "components/Tabs"
import { Empty } from "components/Empty"
import { PromotionExpander } from "./components/PromotionExpander"
import { PromotionEducationPrompt } from "./components/PromotionEducationPrompt"

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

  const archivedPromotions = /* Todo: some real lookup */ promotions
  const { navigate } = props.navigation

  return (
    <Tabs stateRouteName={props.navigation.state.routeName} swipeEnabled={false}>
      <Tab title="Current" route={routes.Promotions.Promotions} badge={promotions.length}>
        {promotions && promotions.length ? (
          <ScrollView style={{ backgroundColor: Colors.screenBackground }}>
            <FlatList
              data={promotions}
              renderItem={({ item }) => <PromotionExpander navigate={navigate} promotion={item} />}
              keyExtractor={(promotion) => promotion.id}
            />
          </ScrollView>
        ) : (
          <PromotionEducationPrompt />
        )}
      </Tab>
      <Tab title="Archived" route={routes.Promotions.PromotionsArchived} badge={promotions.length}>
        {archivedPromotions && archivedPromotions.length ? (
          <ScrollView style={{ backgroundColor: Colors.screenBackground }}>
            <FlatList
              data={archivedPromotions}
              renderItem={({ item }) => (
                <PromotionExpander navigate={navigate} promotion={item} isArchived />
              )}
              keyExtractor={(promotion) => promotion.id}
            />
          </ScrollView>
        ) : (
          <Empty
            message={
              <>
                <P>You haven't archived any old promotions, yet.</P>
                <P>That's okay. You don't have to!</P>
              </>
            }
          />
        )}
      </Tab>
    </Tabs>
  )
}

PromotionsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: null,
    headerTitle: () => <HeaderTitle title="Promotions" align="left" size="large" />,
  }
}
