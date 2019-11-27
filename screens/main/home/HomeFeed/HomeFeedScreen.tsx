import moment from "moment"
import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { Button, Icon } from "@ant-design/react-native"
import { ScrollView } from "react-native"
import { HeaderLogo } from "components/HeaderLogo"
import { useFeedContext } from "providers/feed-context-provider"
import { useOnBoardingContext } from "providers/onboarding-context-provider"
import { SettingsDrawerContext } from "../../settings/SettingsDrawer"
import DevTempNav from "./DevTempNav"
import SuggestedFollows from "./SuggestedFollows"
import { Colors } from "../../../../constants/unit.constants"

interface HomeFeedScreenProps extends NavigationStackScreenProps {}

export const HomeFeedScreen = (props: HomeFeedScreenProps) => {
  const { navigate } = props.navigation
  const feed = useFeedContext()
  const { suggestedFollows, loadSuggestedFollows } = useOnBoardingContext()

  React.useMemo(() => {
    loadSuggestedFollows()
  }, [])

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
      <DevTempNav
        navigation={props.navigation}
        screenProps={props.screenProps}
        theme={props.theme}
      />
      <ScrollView>
        <SuggestedFollows value={suggestedFollows} navigate={navigate} />
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
        onPress={() => navigation.navigate("Messages")}
        style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
        <Icon name="mail" color="#fff" size="md" />
      </Button>
    ),
  }
}
