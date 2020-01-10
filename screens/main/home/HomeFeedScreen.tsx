import React from "react"
import { Alert, ScrollView, View } from "react-native"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { influencerFeedRoutes, routes } from "constants"
import { List } from "@ant-design/react-native"
import { useOnBoardingContext } from "providers/onboarding-context-provider"
import { InfluencerPostHeader, Post } from "components/feed"
import { HeaderLogo } from "components/HeaderLogo"
import { SettingsDrawerContext } from "../settings/SettingsDrawer"
import DevTempNav from "./components/DevTempNav"
import SuggestedFollows from "./components/SuggestedFollows"
import NavButton from "components/NavButton"
import moment from "moment"
import { useFeedContext } from "providers/feed-context-provider"
import * as mockData from "api/feed-services.mockData"

interface HomeFeedScreenProps extends NavigationStackScreenProps {}

export const HomeFeedScreen = (props: HomeFeedScreenProps) => {
  const { navigate } = props.navigation
  const [mode, setMode] = React.useState("homefeed")
  const feedContext = useFeedContext()
  const { feed } = mockData.FEED_DATA
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
            {feed.map((post) => (
              <View key={post.id}>
                <InfluencerPostHeader
                  user={post.user}
                  campaignId={post.campaignId}
                  promotionId={post.promotionId}
                  navigate={navigate}
                  routes={influencerFeedRoutes}
                />
                <Post
                  value={post}
                  navigate={navigate}
                  campaignRouteParams={{
                    isDraft: false,
                    promotionId: post.promotionId,
                    campaignId: post.campaignId,
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
          <NavButton iconName="md-menu" onPress={() => toggle()} position="left" />
        )}
      </SettingsDrawerContext.Consumer>
    ),
    headerTitle: <HeaderLogo />,
    headerRight: (
      <NavButton
        iconName="md-mail"
        onPress={() => navigation.navigate(routes.Home.Messages)}
        position="right"
      />
    ),
  }
}
