import { Button } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"

interface OnBoardingSelectInterestsScreenProps extends NavigationSwitchScreenProps {}

export class OnBoardingSelectInterestsScreen extends React.Component<
  OnBoardingSelectInterestsScreenProps
> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => navigate("OnBoardingSyncContacts")}>Skip</Button>
        <Button onPress={() => navigate("OnBoardingSyncContacts")}>Done</Button>
      </>
    )
  }
}
