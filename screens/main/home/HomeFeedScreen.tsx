import React from "react"
import { Text } from "react-native"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { Alert, ScrollView, View } from "react-native"
import { routes } from "constants"
import { List } from "@ant-design/react-native"
import { useOnBoardingContext } from "providers/onboarding-context-provider"
import { FeedItem, UserInfo } from "components/feed"
import { HeaderLogo } from "components/HeaderLogo"
import { SettingsDrawerContext } from "../settings/SettingsDrawer"
import DevTempNav from "./components/DevTempNav"
import SuggestedFollows from "./components/SuggestedFollows"
import { influencerFeedRoutes } from "../feedRoutes"
import NavButton from "components/NavButton"
import moment from "moment"
import { useFeedContext } from "providers/feed-context-provider"

interface HomeFeedScreenProps extends NavigationStackScreenProps {}

export const HomeFeedScreen = (props: HomeFeedScreenProps) => {
  const { navigate } = props.navigation
  const [mode, setMode] = React.useState("homefeed")
  const feedContext = useFeedContext()
  // const { feed } = mockData.FEED_DETAILS_DATA
  const { suggestedFollows, loadSuggestedFollows } = useOnBoardingContext()

  React.useMemo(() => {
    loadSuggestedFollows()
  }, [])

  React.useEffect(() => {
    if (
      (!feedContext.lastLoadHomeFeed ||
        moment(feedContext.lastLoadHomeFeed).isBefore(moment().subtract(5, "minutes"))) &&
      !feedContext.loading.loadHomeFeed[JSON.stringify([])]
    ) {
      feedContext.loadHomeFeed()
    }
  }, [feedContext.lastLoadHomeFeed])

  const cancelHandler = () => {
    Alert.alert(
      "Start a Campaign?",
      "You recently added a new item to promote. Do you want to start a campaign?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () =>
            navigate(routes.Promotions.CampaignTemplates, {
              promotionId: "606891fe-a0c1-436c-8cb8-ddcdcb3f4268",
            }),
        },
      ]
    )
  }

  const handlePress = (newMode) => {
    newMode === "onboarding" ? setMode("onboarding") : setMode("homefeed")
    newMode === "startcampaign" ? cancelHandler() : null
  }

  return (
    <>
      <DevTempNav onPress={handlePress} mode={mode} />
      <ScrollView>
        {mode === "onboarding" ||
        !(feedContext.homeFeedItems || feedContext.homeFeedItems.length) ? (
          <SuggestedFollows value={suggestedFollows} navigate={navigate} />
        ) : (
          <List>
            {feedContext.homeFeedItems.map((item) => (
              <View key={item.id}>
                <UserInfo user={item.user} navigate={navigate} routes={influencerFeedRoutes} />
                <FeedItem item={item} navigate={navigate} routes={influencerFeedRoutes} />
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
    headerLeft: (
      <SettingsDrawerContext.Consumer>
        {({ open, toggle }) => (
          <NavButton iconName="menu" onPress={() => toggle()} position="left" />
        )}
      </SettingsDrawerContext.Consumer>
    ),
    headerTitle: <HeaderLogo />,
    headerRight: (
      <NavButton
        iconName="mail"
        onPress={() => navigation.navigate(routes.Home.Messages)}
        position="right"
      />
    ),
  }
}
