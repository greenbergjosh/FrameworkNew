import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { HeaderLogo } from "../../components/HeaderLogo"
import { OnBoardingCodeEntryScreen } from "./OnBoardingCodeEntryScreen"
import { OnBoardingResendCodeScreen } from "./OnBoardingResendCodeScreen"
import { OnBoardingSelectInfluencersScreen } from "./OnBoardingSelectInfluencersScreen"
import { OnBoardingSelectInterestsScreen } from "./OnBoardingSelectInterestsScreen"
import { OnBoardingSetPasswordScreen } from "./OnBoardingSetPasswordScreen"
import { OnBoardingStartScreen } from "./OnBoardingStartScreen"
import { OnBoardingSyncContactsScreen } from "./OnBoardingSyncContactsScreen"

interface OnBoardingSectionProps extends NavigationSwitchScreenProps {}

const OnBoardingNavigator = createStackNavigator(
  {
    OnBoardingStart: { screen: OnBoardingStartScreen },
    OnBoardingCodeEntry: { screen: OnBoardingCodeEntryScreen },
    OnBoardingResendCode: { screen: OnBoardingResendCodeScreen },
    OnBoardingSetPassword: { screen: OnBoardingSetPasswordScreen },
    OnBoardingSelectInterests: { screen: OnBoardingSelectInterestsScreen },
    OnBoardingSyncContacts: { screen: OnBoardingSyncContactsScreen },
    OnBoardingSelectInfluencers: { screen: OnBoardingSelectInfluencersScreen },
  },
  {
    initialRouteName: "OnBoardingStart",
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: "#343997",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    },
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
