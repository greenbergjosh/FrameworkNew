import NavButton from "components/NavButton"
import numeral from "numeral"
import React from "react"
import { ActivityIndicator, List } from "@ant-design/react-native"
import { routes } from "routes"
import { Colors, Units } from "styles"
import { H3, STRONG } from "components/Markup"
import { HeaderTitle } from "components/HeaderTitle"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { SafeAreaView, ScrollView } from "react-native"
import { useProfileContext } from "data/contextProviders/profile.contextProvider"

interface AnalyticsScreenProps extends NavigationTabScreenProps {}

export const AnalyticsScreen = (props: AnalyticsScreenProps) => {
  const { navigate } = props.navigation
  const profileContext = useProfileContext()
  const { analytics } = profileContext

  if (
    !profileContext.lastLoadAnalytics &&
    !profileContext.loading.loadAnalytics[JSON.stringify([])]
  ) {
    profileContext.loadAnalytics()
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }
  if (!profileContext.lastLoadAnalytics) {
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }
  const { reach, impressionsCount, clickThruCount, itemsSoldCount, commissionTotal } = analytics

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <H3
          style={{
            color: Colors.bodyTextEmphasis,
            margin: Units.margin,
            marginTop: Units.margin * 2,
          }}>
          Your Reach (depth of followers): {numeral(reach).format()}
        </H3>
        <List renderHeader={"ACTIVITY THIS MONTH"}>
          <List.Item>
            <H3>
              Impressions{" "}
              <STRONG style={{ color: Colors.bodyTextEmphasis }}>
                {numeral(impressionsCount).format()}
              </STRONG>
            </H3>
          </List.Item>
          <List.Item>
            <H3>
              Click Throughs{" "}
              <STRONG style={{ color: Colors.bodyTextEmphasis }}>
                {numeral(clickThruCount).format()}
              </STRONG>
            </H3>
          </List.Item>
          <List.Item>
            <H3>
              Items Sold{" "}
              <STRONG style={{ color: Colors.bodyTextEmphasis }}>
                {numeral(itemsSoldCount).format()}
              </STRONG>
            </H3>
          </List.Item>
          <List.Item>
            <H3>
              Commissions Earned{" "}
              <STRONG style={{ color: Colors.bodyTextEmphasis }}>
                {numeral(commissionTotal).format("$0,0.00")}
              </STRONG>
            </H3>
          </List.Item>
        </List>
      </ScrollView>
    </SafeAreaView>
  )
}

AnalyticsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <NavButton onPress={() => navigation.navigate(routes.Home.Feed)} position="left">
        Cancel
      </NavButton>
    ),
    headerTitle: <HeaderTitle title="Analytics" />,
    headerRight: (
      <NavButton
        onPress={() => navigation.navigate(routes.Home.Feed)}
        type="primary"
        position="right">
        Done
      </NavButton>
    ),
  }
}
