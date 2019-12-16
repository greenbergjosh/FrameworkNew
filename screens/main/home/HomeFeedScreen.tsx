import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { Alert, ScrollView, View } from "react-native"
import { routes, Units } from "constants"
import { List } from "@ant-design/react-native"
import { useOnBoardingContext } from "providers/onboarding-context-provider"
import { FeedItem, UserInfo } from "components/feed"
import { HeaderLogo } from "components/HeaderLogo"
import TouchIcon from "components/TouchIcon"
import { SettingsDrawerContext } from "../settings/SettingsDrawer"
import DevTempNav from "./components/DevTempNav"
import SuggestedFollows from "./components/SuggestedFollows"
import { influencerFeedRoutes } from "../feedRoutes"
import NavButton from "components/NavButton"
import * as mockData from "api/feed-services.mockData"

interface HomeFeedScreenProps extends NavigationStackScreenProps {}

export const HomeFeedScreen = (props: HomeFeedScreenProps) => {
  const { navigate } = props.navigation
  const [mode, setMode] = React.useState("homefeed")
  // const feed = useFeedContext()
  const { feed } = mockData.FEED_DETAILS_DATA
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

  const showStartCampaignDialog = () => {
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

  return (
    <>
      <DevTempNav mode={mode} setMode={setMode} showStartCampaignDialog={showStartCampaignDialog} />
      <ScrollView>
        {mode === "onboarding" ? (
          <SuggestedFollows value={suggestedFollows} navigate={navigate} />
        ) : (
          <List>
            {feed.map((item) => (
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
