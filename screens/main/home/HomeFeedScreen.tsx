import React from "react"
import { Alert, SafeAreaView, ScrollView, View } from "react-native"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { influencerFeedRoutes, routes } from "constants"
import { ActivityIndicator, List } from "@ant-design/react-native"
import { InfluencerPostHeader, Post } from "components/feed"
import { HeaderLogo } from "components/HeaderLogo"
import { SettingsDrawerContext } from "../settings/SettingsDrawer"
import DevTempNav from "./components/DevTempNav"
import SuggestedInfluencers from "./components/SuggestedInfluencers"
import NavButton from "components/NavButton"
import moment from "moment"
import { useFeedContext } from "data/contextProviders/feed.contextProvider"
import { BottomTabBar } from "components/BottomTabBar"

interface HomeFeedScreenProps extends NavigationStackScreenProps {}

export const HomeFeedScreen = (props: HomeFeedScreenProps) => {
  const { navigate } = props.navigation
  const [mode, setMode] = React.useState("homefeed")
  const feedContext = useFeedContext()
  const { homeFeed } = feedContext

  /*
   * Refresh home feed every few minutes
   */
  React.useEffect(() => {
    if (
      (!feedContext.lastLoadHomeFeed ||
        moment(feedContext.lastLoadHomeFeed).isBefore(moment().subtract(5, "minutes"))) &&
      !feedContext.loading.loadHomeFeed[JSON.stringify([])]
    ) {
      feedContext.loadHomeFeed()
    }
  }, [feedContext.lastLoadHomeFeed])

  if (!feedContext.lastLoadHomeFeed) {
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

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
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <DevTempNav
          mode={mode}
          setMode={setMode}
          showStartCampaignDialog={() =>
            showStartCampaignDialog("606891fe-a0c1-436c-8cb8-ddcdcb3f4268")
          }
        />
        {mode === "onboarding" ? (
          <SuggestedInfluencers navigate={navigate} />
        ) : (
          <List>
            {homeFeed.map((post) => (
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
      <BottomTabBar activeTab={routes.Home.default} />
    </SafeAreaView>
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
