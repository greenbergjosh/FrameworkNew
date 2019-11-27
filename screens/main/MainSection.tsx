import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { createBottomTabNavigator } from "react-navigation-tabs"
import { HeaderLogo } from "components/HeaderLogo"
import { ExploreSection } from "./explore/ExploreSection"
import { FollowsSection } from "./follows/FollowsSection"
import { HomeSection } from "./home/HomeSection"
import { ProfileSection } from "./profile/ProfileSection"
import { PromotionsSection } from "./promotions/PromotionsSection"
import { SettingsDrawer, SettingsDrawerContext } from "./settings/SettingsDrawer"

interface MainSectionProps extends NavigationSwitchScreenProps {}
interface MainSectionState {
  settingsDrawerOpen: boolean
}

const MainNavigator = createBottomTabNavigator(
  {
    Home: { screen: HomeSection },
    Explore: { screen: ExploreSection },
    Promotions: { screen: PromotionsSection },
    Follows: { screen: FollowsSection },
    Profile: { screen: ProfileSection },
  },
  {
    initialRouteName: "Home",
    defaultNavigationOptions: {},
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
