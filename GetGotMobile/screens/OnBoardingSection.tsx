import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { HeaderLogo } from "components/HeaderLogo"
import { onboardingRoutes } from "screens/onboarding/routes"
import { defaultNavigationOptions, routes } from "routes"

interface OnBoardingSectionProps extends NavigationSwitchScreenProps {}

const OnBoardingNavigator = createStackNavigator(onboardingRoutes, {
  initialRouteName: routes.OnBoarding.default,
  defaultNavigationOptions,
})

export class OnBoardingSection extends React.Component<OnBoardingSectionProps> {
  static router = OnBoardingNavigator.router

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderLogo />,
    }
  }
  render() {
    return <OnBoardingNavigator navigation={this.props.navigation} />
  }
}
