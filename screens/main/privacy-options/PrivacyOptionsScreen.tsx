import { Button, Toast } from "@ant-design/react-native"
import React from "react"
import { Text } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors } from "constants"

interface PrivacyOptionsScreenProps extends NavigationTabScreenProps {}

export class PrivacyOptionsScreen extends React.Component<PrivacyOptionsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: () => (
        <Button
          onPress={() => navigation.navigate("HomeFeed")}
          style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
          <Text style={{ color: "#fff" }}>Cancel</Text>
        </Button>
      ),
      headerTitle: () => <HeaderTitle title="Privacy Options" />,
      headerRight: () => (
        <Button
          onPress={() => navigation.navigate("HomeFeed")}
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
        <Button onPress={() => Toast.info("This is an PrivacyOptions toast")}>
          Show PrivacyOptions Toast
        </Button>
      </>
    )
  }
}
