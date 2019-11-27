import { Button, Toast } from "@ant-design/react-native"
import React from "react"
import { Text } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"

interface AnalyticsScreenProps extends NavigationTabScreenProps {}

export class AnalyticsScreen extends React.Component<AnalyticsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: () => (
        <Button
          onPress={() => navigation.navigate("HomeFeed")}
          style={{ backgroundColor: "#343997", borderWidth: 0 }}>
          <Text style={{ color: "#fff" }}>Cancel</Text>
        </Button>
      ),
      headerTitle: () => <HeaderTitle title="Analytics" />,
      headerRight: () => (
        <Button
          onPress={() => navigation.navigate("HomeFeed")}
          style={{ backgroundColor: "#343997", borderWidth: 0 }}>
          <Text style={{ fontWeight: "bold", color: "#fff" }}>Done</Text>
        </Button>
      ),
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => Toast.info("This is an Analytics toast")}>
          Show Analytics Toast
        </Button>
      </>
    )
  }
}
