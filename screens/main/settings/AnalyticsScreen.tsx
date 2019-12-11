import { List } from "@ant-design/react-native"
import React from "react"
import { Text, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors, routes, styles } from "constants"
import { H3 } from "components/Markup"
import NavButton from "components/NavButton"

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
    return (
      <>
        <View style={styles.ViewContainer}>
          <H3 style={{ color: Colors.bodyTextEmphasis }}>Your Reach (depth of followers): 139</H3>
        </View>
        <List renderHeader={"ACTIVITY THIS MONTH"}>
          <List.Item>
            <H3>
              Impressions{" "}
              <Text style={{ fontWeight: "bold", color: Colors.bodyTextEmphasis }}>2,526</Text>
            </H3>
          </List.Item>
          <List.Item>
            <H3>
              Click Throughs{" "}
              <Text style={{ fontWeight: "bold", color: Colors.bodyTextEmphasis }}>396</Text>
            </H3>
          </List.Item>
          <List.Item>
            <H3>
              Items Sold{" "}
              <Text style={{ fontWeight: "bold", color: Colors.bodyTextEmphasis }}>52</Text>
            </H3>
          </List.Item>
          <List.Item>
            <H3>
              Commissions Earned{" "}
              <Text style={{ fontWeight: "bold", color: Colors.bodyTextEmphasis }}>$126</Text>
            </H3>
          </List.Item>
        </List>
      </>
    )
  }
}
