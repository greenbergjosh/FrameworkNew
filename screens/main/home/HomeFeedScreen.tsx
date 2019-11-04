import { Button, Icon, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { HeaderLogo } from "../../../components/HeaderLogo"
import { SettingsDrawerContext } from "../settings/SettingsDrawer"

interface HomeFeedScreenProps extends NavigationStackScreenProps {}

export class HomeFeedScreen extends React.Component<HomeFeedScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: () => (
        <SettingsDrawerContext.Consumer>
          {({ open, toggle }) => (
            <Button onPress={() => toggle()} style={{ backgroundColor: "#343997", borderWidth: 0 }}>
              <Icon name="menu" size="md" color="#fff" />
            </Button>
          )}
        </SettingsDrawerContext.Consumer>
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
        <Button onPress={() => navigate("ExploreUserFeed", { name: "Loren" })}>Jump To User</Button>
        <Button onPress={() => navigate("ExploreCampaign", { name: "Loren" })}>
          Jump To Campaign
        </Button>
        <Button onPress={() => Toast.info("This is a Home screen toast")}>Show Home</Button>
      </>
    )
  }
}
