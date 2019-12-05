import { Button, List, WhiteSpace } from "@ant-design/react-native"
import React from "react"
import { Text, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors, routes, styles, Units } from "constants"

interface AnalyticsScreenProps extends NavigationTabScreenProps {}

export class AnalyticsScreen extends React.Component<AnalyticsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: () => (
        <Button
          onPress={() => navigation.navigate(routes.Home.Feed)}
          style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
          <Text style={{ color: "#fff" }}>Cancel</Text>
        </Button>
      ),
      headerTitle: () => <HeaderTitle title="Analytics" />,
      headerRight: () => (
        <Button
          onPress={() => navigation.navigate(routes.Home.Feed)}
          style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
          <Text style={{ fontWeight: "bold", color: "#fff" }}>Done</Text>
        </Button>
      ),
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <View style={styles.ViewContainer}>
          <Text style={[styles.H3, { color: Colors.black }]}>
            Your Reach (depth of followers): 139
          </Text>
        </View>
        <List renderHeader={"ACTIVITY THIS MONTH"}>
          <List.Item>
            <Text style={styles.H3}>
              Impressions <Text style={{ fontWeight: "bold", color: Colors.black }}>2,526</Text>
            </Text>
          </List.Item>
          <List.Item>
            <Text style={styles.H3}>
              Click Throughs <Text style={{ fontWeight: "bold", color: Colors.black }}>396</Text>
            </Text>
          </List.Item>
          <List.Item>
            <Text style={styles.H3}>
              Items Sold <Text style={{ fontWeight: "bold", color: Colors.black }}>52</Text>
            </Text>
          </List.Item>
          <List.Item>
            <Text style={styles.H3}>
              Commissions Earned{" "}
              <Text style={{ fontWeight: "bold", color: Colors.black }}>$126</Text>
            </Text>
          </List.Item>
        </List>
      </>
    )
  }
}
