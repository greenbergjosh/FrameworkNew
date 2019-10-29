import { Button, Icon, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { HeaderLogo } from "../../../components/HeaderLogo"
import { SettingsDrawer } from "../settings/SettingsDrawer"

interface HomeFeedScreenProps extends NavigationStackScreenProps {}

export class HomeFeedScreen extends React.Component<HomeFeedScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: () => (
        <Button
          onPress={() =>
            navigation.navigate("HomeFeed", {
              settingsDrawerOpen: !navigation.getParam("settingsDrawerOpen"),
            })
          }
          style={{ backgroundColor: "#343997", borderWidth: 0 }}>
          <Icon name="menu" size="md" color="#fff" />
        </Button>
      ),
      headerTitle: () => <HeaderLogo />,
      headerRight: () => (
        <Button
          onPress={() => navigation.navigate("Messages")}
          style={{ backgroundColor: "#343997", borderWidth: 0 }}>
          <Icon name="mail" color="#fff" size="md" />
        </Button>
      ),
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => navigate("Profile", { name: "Jane" })}>Go To Profile</Button>
        <Button onPress={() => Toast.info("This is a toast tips")}>Show Home</Button>
        <SettingsDrawer
          open={this.props.navigation.getParam("settingsDrawerOpen")}
          navigation={this.props.navigation}
        />
      </>
    )
  }
}
