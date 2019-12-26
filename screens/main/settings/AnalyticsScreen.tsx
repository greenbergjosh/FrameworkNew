import { List } from "@ant-design/react-native"
import React from "react"
import { Text, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors, routes, styles } from "constants"
import { H3, STRONG } from "components/Markup"
import NavButton from "components/NavButton"
import numeral from "numeral"
import { ANALYTICS_DATA } from "api/profile-services.mockData"

interface AnalyticsScreenProps extends NavigationTabScreenProps {}

export class AnalyticsScreen extends React.Component<AnalyticsScreenProps> {
  static navigationOptions = ({ navigation }) => {
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
  render() {
    const { navigate } = this.props.navigation
    const {
      reach,
      impressionsCount,
      clickThruCount,
      itemsSoldCount,
      commissionTotal,
    } = ANALYTICS_DATA
    return (
      <>
        <View style={styles.ViewContainer}>
          <H3 style={{ color: Colors.bodyTextEmphasis }}>
            Your Reach (depth of followers): {numeral(reach).format()}
          </H3>
        </View>
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
      </>
    )
  }
}
