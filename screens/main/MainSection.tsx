import { HeaderLogo } from "components/HeaderLogo"
import { routes } from "constants"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { createBottomTabNavigator } from "react-navigation-tabs"
import { ExploreSection } from "./explore/ExploreSection"
import { FollowsSection } from "./follows/FollowsSection"
import { HomeSection } from "./home/HomeSection"
import { MessagesSection } from "./messages/MessagesSection"
import { ProfileSection } from "./profile/ProfileSection"
import { PromotionsSection } from "./promotions/PromotionsSection"
import { SettingsDrawer, SettingsDrawerContext } from "./settings/SettingsDrawer"
import { SettingsSection } from "./settings/SettingsSection"

interface MainSectionProps extends NavigationSwitchScreenProps {}
interface MainSectionState {
  settingsDrawerOpen: boolean
}

const MainNavigator = createBottomTabNavigator(
  {
    [routes.Main.Home]: { screen: HomeSection },
    [routes.Main.Explore]: { screen: ExploreSection },
    [routes.Main.Promotions]: { screen: PromotionsSection },
    [routes.Main.Follows]: { screen: FollowsSection },
    [routes.Main.Profile]: { screen: ProfileSection },
  },
  {
    initialRouteName: routes.Main.default,
    defaultNavigationOptions: {},
    tabBarOptions: {
      keyboardHidesTabBar: true,
      labelPosition: "below-icon",
      labelStyle: { textAlign: "center" },
      tabStyle: { width: "auto" },
    },
  }
)

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
