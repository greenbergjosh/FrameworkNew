import { Button, Icon, Toast } from "@ant-design/react-native"
import moment from "moment"
import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { HeaderLogo } from "../../../components/HeaderLogo"
import { useAuthContext } from "../../../providers/auth-context-provider"
import { useFeedContext } from "../../../providers/feed-context-provider"
import { SettingsDrawerContext } from "../settings/SettingsDrawer"

interface HomeFeedScreenProps extends NavigationStackScreenProps {}

export const HomeFeedScreen = (props: HomeFeedScreenProps) => {
  const { navigate } = props.navigation
  const feed = useFeedContext()

  React.useEffect(() => {
    if (
      !feed.lastLoadHomeFeed ||
      moment(feed.lastLoadHomeFeed).isBefore(moment().subtract(5, "minutes"))
    ) {
      feed.loadHomeFeed()
    }
  }, [feed.lastLoadHomeFeed])

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

HomeFeedScreen.navigationOptions = ({ navigation }) => {
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
