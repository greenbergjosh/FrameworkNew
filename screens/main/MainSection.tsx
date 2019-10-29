import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { createBottomTabNavigator } from "react-navigation-tabs"
import { HeaderLogo } from "../../components/HeaderLogo"
import { ExploreScreen } from "./explore/ExploreScreen"
import { FollowsScreen } from "./follows/FollowsScreen"
import { HomeSection } from "./home/HomeSection"
import { ProfileScreen } from "./profile/ProfileScreen"
import { PromotionsScreen } from "./promotions/PromotionsScreen"

interface MainSectionProps extends NavigationSwitchScreenProps {}

const MainNavigator = createBottomTabNavigator(
  {
    Home: { screen: HomeSection },
    Explore: { screen: ExploreScreen },
    Promotions: { screen: PromotionsScreen },
    Follows: { screen: FollowsScreen },
    Profile: { screen: ProfileScreen },
  },
  {
    initialRouteName: "Home",
    defaultNavigationOptions: {},
  }
)

export class MainSection extends React.Component<MainSectionProps> {
  static router = MainNavigator.router

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderLogo />,
    }
  }
  render() {
    return <MainNavigator navigation={this.props.navigation} />
  }
}
