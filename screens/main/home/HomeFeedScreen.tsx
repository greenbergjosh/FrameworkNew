import moment from "moment"
import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { Button, Flex, Icon, Toast, WhiteSpace } from "@ant-design/react-native"
import { ScrollView, Text, View } from "react-native"
import { HeaderLogo } from "components/HeaderLogo"
import { useAuthContext } from "providers/auth-context-provider"
import { useFeedContext } from "providers/feed-context-provider"
import { SettingsDrawerContext } from "../settings/SettingsDrawer"
import { styles } from "constants"

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
      {/*****************************************
       * Temporary Navigation for Development
       */}
      <Flex direction="row" justify="around" style={styles.View}>
        <Button size="small" onPress={() => navigate("ExploreUserFeed", { name: "Loren" })}>
          Jump To User
        </Button>
        <Button size="small" onPress={() => navigate("ExploreCampaign", { name: "Loren" })}>
          Jump To Campaign
        </Button>
        <Button size="small" onPress={() => Toast.info("This is a Home screen toast")}>
          Show Home
        </Button>
      </Flex>

      {/*****************************************
       * No Follows View
       */}
      <ScrollView>
        <View style={styles.View}>
          <Text style={styles.H2}>Welcome to GetGot</Text>
          <WhiteSpace size="lg" />
          <Text style={[styles.H3, { textAlign: "center" }]}>
            When you follow people, you&rsquo;ll see the products and services that they recommend.
          </Text>
        </View>
        <View>
          <Text style={[styles.Body, { textAlign: "center" }]}>[ OnBoarding Carousel Here ]</Text>
        </View>
      </ScrollView>
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
