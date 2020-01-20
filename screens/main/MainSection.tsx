import { HeaderLogo } from "components/HeaderLogo"
import { defaultNavigationOptions, routes } from "constants"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { exploreRoutes } from "./explore/exploreRoutes"
import { followsRoutes } from "./follows/followsRoutes"
import { homeRoutes } from "./home/homeRoutes"
import { messagesRoutes } from "./messages/messagesRoutes"
import { profileRoutes } from "./profile/profileRoutes"
import { promotionsRoutes } from "./promotions/promotionsRoutes"
import { SettingsDrawer, SettingsDrawerContext } from "./settings/SettingsDrawer"
import { settingsRoutes } from "./settings/settingsRoutes"
import { createStackNavigator } from "react-navigation-stack"
import { HomeFeedScreen } from "./home/HomeFeedScreen"
import { FeedScreen } from "./explore/FeedScreen"
import { PromotionsScreen } from "./promotions/PromotionsScreen"
import { FollowsScreen } from "./follows/FollowsScreen"
import { ProfileScreen } from "./profile/ProfileScreen"
import { Animated, Easing } from "react-native"

interface MainSectionProps extends NavigationSwitchScreenProps {}
interface MainSectionState {
  settingsDrawerOpen: boolean
}

export const mainRootRoutes = {
  [routes.Main.Home]: { screen: HomeFeedScreen },
  [routes.Main.Explore]: { screen: FeedScreen },
  [routes.Main.Promotions]: { screen: PromotionsScreen },
  [routes.Main.Follows]: { screen: FollowsScreen },
  [routes.Main.Profile]: { screen: ProfileScreen },
}

export const mainRoutes = {
  ...exploreRoutes,
  ...followsRoutes,
  ...homeRoutes,
  ...messagesRoutes,
  ...profileRoutes,
  ...promotionsRoutes,
  ...settingsRoutes,
  ...mainRootRoutes,
}

/**
 * See: https://reactnavigation.org/docs/en/stack-navigator-1.0.html#modal-stacknavigator-with-custom-screen-transitions
 * @constructor
 */
const TransitionConfiguration = () => {
  return {
    transitionSpec: {
      duration: 750,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
      useNativeDriver: true,
    },
    screenInterpolator: (sceneProps) => {
      const { layout, position, scene } = sceneProps
      const { index, route } = scene
      const width = layout.initWidth

      /*
         Allow transitions to be defined on-the-fly with
         navigate(routeName, { tansition: "TransitionName" }
       */
      const params = route.params || {}
      const transition = params.transition || "default"

      const opacity = position.interpolate({
        inputRange: [index - 1, index - 0.99, index],
        outputRange: [0, 1, 1],
      })

      const translateX = position.interpolate({
        inputRange: [index - 1, index, index + 1],
        outputRange: [width, 0, 0],
      });

      return {
        fade: { opacity },
        default: { transform: [{ translateX }] },
      }[transition]
    },
  }
}

const MainNavigator = createStackNavigator(mainRoutes, {
  initialRouteName: routes.Main.default,
  defaultNavigationOptions,
  transitionConfig: TransitionConfiguration,
})

export class MainSection extends React.Component<MainSectionProps, MainSectionState> {
  static router = MainNavigator.router

  state = {
    settingsDrawerOpen: false,
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderLogo />,
    }
  }
  render() {
    return (
      <SettingsDrawerContext.Provider
        value={{
          open: this.state.settingsDrawerOpen,
          toggle: (state?: boolean) =>
            this.setState({
              settingsDrawerOpen:
                typeof state === "boolean" ? state : !this.state.settingsDrawerOpen,
            }),
        }}>
        <SettingsDrawer open={this.state.settingsDrawerOpen} navigation={this.props.navigation}>
          <MainNavigator navigation={this.props.navigation} />
        </SettingsDrawer>
      </SettingsDrawerContext.Provider>
    )
  }
}
