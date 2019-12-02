import {
  Button,
  Icon,
  List,
  SearchBar
  } from "@ant-design/react-native"
import FeedGrid from "components/feed/FeedGrid"
import { FEED_DETAILS_DATA } from "components/feed/mockData"
import { HeaderLogo } from "components/HeaderLogo"
import { Colors, routes } from "constants"
import moment from "moment"
import { useFeedContext } from "providers/feed-context-provider"
import { useOnBoardingContext } from "providers/onboarding-context-provider"
import React from "react"
import { ScrollView, Text, View } from "react-native"
import { NavigationStackScreenProps } from "react-navigation-stack"
import FeedItem from "../../../components/feed/FeedItem"
import { UserInfoSmall } from "../../../components/feed/UserInfo"
import { SettingsDrawerContext } from "../settings/SettingsDrawer"
import DevTempNav from "./components/DevTempNav"
import SuggestedFollows from "./components/SuggestedFollows"

interface HomeFeedScreenProps extends NavigationStackScreenProps {}

export const HomeFeedScreen = (props: HomeFeedScreenProps) => {
  const { navigate } = props.navigation
  const [mode, setMode] = React.useState("onboarding")
  // const feed = useFeedContext()
  const { feed } = FEED_DETAILS_DATA
  const { suggestedFollows, loadSuggestedFollows } = useOnBoardingContext()

  React.useMemo(() => {
    loadSuggestedFollows()
  }, [])

  // React.useEffect(() => {
  //   if (
  //     !feed.lastLoadHomeFeed ||
  //     moment(feed.lastLoadHomeFeed).isBefore(moment().subtract(5, "minutes"))
  //   ) {
  //     feed.loadHomeFeed()
  //   }
  // }, [feed.lastLoadHomeFeed])

  const handlePress = (newMode) => {
    newMode === "onboarding" ? setMode("onboarding") : setMode("homefeed")
  }

  return (
    <>
      <DevTempNav onPress={handlePress} />
      <ScrollView>
        {mode === "onboarding" ? (
          <SuggestedFollows value={suggestedFollows} navigate={navigate} />
        ) : (
          <List>
            {feed.map((item) => (
              <View key={item.id}>
                <UserInfoSmall user={item.user} navigate={navigate} />
                <FeedItem item={item} navigate={navigate} />
              </View>
            ))}
          </List>
        )}
      </ScrollView>
    </>
  )
}

HomeFeedScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: () => (
      <SettingsDrawerContext.Consumer>
        {({ open, toggle }) => (
          <Button onPress={() => toggle()} style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
            <Icon name="menu" size="md" color="#fff" />
          </Button>
        )}
      </SettingsDrawerContext.Consumer>
    ),
    headerTitle: () => <HeaderLogo />,
    headerRight: () => (
      <Button
        onPress={() => navigation.navigate(routes.Main.Messages)}
        style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
        <Icon name="mail" color="#fff" size="md" />
      </Button>
    ),
  }
}
