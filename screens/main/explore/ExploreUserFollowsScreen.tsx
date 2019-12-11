import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { FollowsList, InfluencersList } from "components/follows"
import { H3 } from "components/Markup"
import { routes, styles } from "constants"
import { influencerFeedRoutes } from "../feedRoutes"
import NavButton from "components/NavButton"
import { NavigationState, TabBar, TabView } from "react-native-tab-view"
import { Dimensions } from "react-native"
import { Colors, FontWeights } from "../../../constants/unit.constants"

export interface ExploreUserFollowsScreenProps extends NavigationTabScreenProps {}

export class ExploreUserFollowsScreen extends React.Component<ExploreUserFollowsScreenProps> {
  constructor(props) {
    super(props)

    let index = 0
    switch (props.navigation.state.routeName) {
      case routes.Explore.UserFollowsMutual:
        index = 0
        break
      case routes.Explore.UserFollowsFollowers:
        index = 1
        break
      case routes.Explore.UserFollowsInfluencers:
        index = 2
        break
    }

    this.state = {
      index,
      routes: [
        { key: routes.Explore.UserFollowsMutual, title: "Mutual" },
        { key: routes.Explore.UserFollowsFollowers, title: "Followers" },
        { key: routes.Explore.UserFollowsInfluencers, title: "Following" },
      ],
    }
  }

  state: NavigationState<any>

  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
      headerTitle: <HeaderTitle title="loren" />,
    }
  }

  render() {
    const { navigate } = this.props.navigation

    return (
      <TabView
        navigationState={this.state}
        renderScene={({ route }) => {
          switch (route.key) {
            case routes.Explore.UserFollowsMutual:
              return <InfluencersList navigate={navigate} routes={influencerFeedRoutes} />
            case routes.Explore.UserFollowsFollowers:
              return <FollowsList navigate={navigate} routes={influencerFeedRoutes} />
            case routes.Explore.UserFollowsInfluencers:
              return <FollowsList navigate={navigate} routes={influencerFeedRoutes} />
            default:
              return null
          }
        }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{ backgroundColor: Colors.navBarBackground }}
            indicatorStyle={{ backgroundColor: Colors.link }}
            renderLabel={({ route, focused, color }) => (
              <H3
                style={{
                  color: focused ? Colors.link : Colors.bodyText,
                  paddingRight: 5,
                }}>
                {route.title}
              </H3>
            )}
            labelStyle={[
              styles.H3,
              { color: Colors.bodyTextEmphasis, textTransform: "capitalize" },
            ]}
          />
        )}
        onIndexChange={(index) => this.setState({ index })}
        initialLayout={{ width: Dimensions.get("window").width }}
      />
    )
  }
}
