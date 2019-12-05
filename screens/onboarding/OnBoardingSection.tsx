import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { HeaderLogo } from "components/HeaderLogo"
import { OnBoardingCodeEntryScreen } from "./OnBoardingCodeEntryScreen"
import { OnBoardingResendCodeScreen } from "./OnBoardingResendCodeScreen"
import { OnBoardingSelectInterestsScreen } from "./OnBoardingSelectInterestsScreen"
import { OnBoardingSetPasswordScreen } from "./OnBoardingSetPasswordScreen"
import { OnBoardingCreateAccountScreen } from "./OnBoardingCreateAccountScreen"
import { OnBoardingSyncContactsScreen } from "./OnBoardingSyncContactsScreen"
import { OnBoardingTourScreen } from "./OnBoardingTourScreen"
import { defaultNavigationOptions, routes } from "constants"

interface OnBoardingSectionProps extends NavigationSwitchScreenProps {}

const OnBoardingNavigator = createStackNavigator(
  {
    [routes.OnBoarding.CreateAccount]: { screen: OnBoardingCreateAccountScreen },
    [routes.OnBoarding.CodeEntry]: { screen: OnBoardingCodeEntryScreen },
    [routes.OnBoarding.ResendCode]: { screen: OnBoardingResendCodeScreen },
    [routes.OnBoarding.SetPassword]: { screen: OnBoardingSetPasswordScreen },
    [routes.OnBoarding.SelectInterests]: { screen: OnBoardingSelectInterestsScreen },
    [routes.OnBoarding.SyncContacts]: { screen: OnBoardingSyncContactsScreen },
    [routes.OnBoarding.Tour]: { screen: OnBoardingTourScreen },
  },
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
