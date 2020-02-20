import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { HeaderLogo } from "components/HeaderLogo"
import { CodeEntryScreen } from "./CodeEntryScreen"
import { ResendCodeScreen } from "./ResendCodeScreen"
import { SelectInterestsScreen } from "./SelectInterestsScreen"
import { SetPasswordScreen } from "./SetPasswordScreen"
import { CreateAccountScreen } from "./CreateAccountScreen"
import { SyncContactsScreen } from "./SyncContactsScreen"
import { TourScreen } from "./TourScreen"
import { defaultNavigationOptions, routes } from "routes"

interface OnBoardingSectionProps extends NavigationSwitchScreenProps {}

export const onboardingRoutes = {
  [routes.OnBoarding.CreateAccount]: { screen: CreateAccountScreen },
  [routes.OnBoarding.CodeEntry]: { screen: CodeEntryScreen },
  [routes.OnBoarding.ResendCode]: { screen: ResendCodeScreen },
  [routes.OnBoarding.SetPassword]: { screen: SetPasswordScreen },
  [routes.OnBoarding.SelectInterests]: { screen: SelectInterestsScreen },
  [routes.OnBoarding.SyncContacts]: { screen: SyncContactsScreen },
  [routes.OnBoarding.Tour]: { screen: TourScreen },
}

const OnBoardingNavigator = createStackNavigator(
  onboardingRoutes,
  {
    initialRouteName: routes.OnBoarding.default,
    defaultNavigationOptions,
  }
)

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
