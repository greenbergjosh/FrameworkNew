import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { HeaderLogo } from "../../components/HeaderLogo"
import { OnBoardingCodeEntryScreen } from "./OnBoardingCodeEntryScreen"
import { OnBoardingResendCodeScreen } from "./OnBoardingResendCodeScreen"
import { OnBoardingSelectInterestsScreen } from "./OnBoardingSelectInterestsScreen"
import { OnBoardingSetPasswordScreen } from "./OnBoardingSetPasswordScreen"
import { OnBoardingCreateAccountScreen } from "./OnBoardingCreateAccountScreen"
import { OnBoardingSyncContactsScreen } from "./OnBoardingSyncContactsScreen"
import { styles, Colors, defaultNavigationOptions, routes } from "constants"


interface OnBoardingSectionProps extends NavigationSwitchScreenProps {}

const OnBoardingNavigator = createStackNavigator(
  {
    OnBoardingCreateAccount: { screen: OnBoardingCreateAccountScreen },
    OnBoardingCodeEntry: { screen: OnBoardingCodeEntryScreen },
    OnBoardingResendCode: { screen: OnBoardingResendCodeScreen },
    OnBoardingSetPassword: { screen: OnBoardingSetPasswordScreen },
    OnBoardingSelectInterests: { screen: OnBoardingSelectInterestsScreen },
    OnBoardingSyncContacts: { screen: OnBoardingSyncContactsScreen },
  },
  {
    initialRouteName: routes.OnBoarding.CreateAccount,
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
