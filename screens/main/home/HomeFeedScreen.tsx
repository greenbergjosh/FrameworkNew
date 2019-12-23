import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { Alert, ScrollView, View } from "react-native"
import { influencerFeedRoutes, routes } from "constants"
import { List } from "@ant-design/react-native"
import { useOnBoardingContext } from "providers/onboarding-context-provider"
import { FeedItem } from "components/feed"
import { InfluencerInfoShort } from "components/user-info"
import { HeaderLogo } from "components/HeaderLogo"
import { SettingsDrawerContext } from "../settings/SettingsDrawer"
import DevTempNav from "./components/DevTempNav"
import SuggestedFollows from "./components/SuggestedFollows"
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

  const showStartCampaignDialog = (promotionId: GUID) => {
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
              promotionId,
            }),
        },
      ]
    )
  }

  return (
    <>
      <DevTempNav
        mode={mode}
        setMode={setMode}
        showStartCampaignDialog={() =>
          showStartCampaignDialog("606891fe-a0c1-436c-8cb8-ddcdcb3f4268")
        }
      />
      <ScrollView>
        {mode === "onboarding" ? (
          <SuggestedFollows influencers={suggestedFollows} navigate={navigate} />
        ) : (
          <List>
            {feed.map((feedItem) => (
              <View key={feedItem.id}>
                <InfluencerInfoShort user={feedItem.user} navigate={navigate} routes={influencerFeedRoutes} />
                <FeedItem
                  image={feedItem.image}
                  navigate={navigate}
                  campaignRouteParams={{
                    isDraft: false,
                    promotionId: feedItem.promotionId,
                    campaignId: feedItem.campaignId,
                  }}
                  routes={influencerFeedRoutes}
                />
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
