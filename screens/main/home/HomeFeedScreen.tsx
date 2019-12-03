import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { ScrollView, View } from "react-native"
import { routes, Units } from "constants"
import { List } from "@ant-design/react-native"
import { useOnBoardingContext } from "providers/onboarding-context-provider"
import { FEED_DETAILS_DATA } from "components/feed/mockData"
import { HeaderLogo } from "components/HeaderLogo"
import TouchIcon from "components/TouchIcon"
import FeedItem from "components/feed/FeedItem"
import { UserInfoSmall } from "components/feed/UserInfo"
import { SettingsDrawerContext } from "../settings/SettingsDrawer"
import DevTempNav from "./components/DevTempNav"
import SuggestedFollows from "./components/SuggestedFollows"

interface HomeFeedScreenProps extends NavigationStackScreenProps {}

export const HomeFeedScreen = (props: HomeFeedScreenProps) => {
  const { navigate } = props.navigation
  const [mode, setMode] = React.useState("homefeed")
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
          <TouchIcon
            name="menu"
            reverse
            size="md"
            onPress={() => toggle()}
            style={{ marginLeft: Units.margin / 2 }}
          />
        )}
      </SettingsDrawerContext.Consumer>
    ),
    headerTitle: () => <HeaderLogo />,
    headerRight: () => (
      <TouchIcon
        name="mail"
        reverse
        size="md"
        onPress={() => navigation.navigate(routes.Home.Messages)}
        style={{ marginRight: Units.margin / 2 }}
      />
    ),
  }
}
