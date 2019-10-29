import { Button } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"

interface OnBoardingSyncContactsScreenProps extends NavigationSwitchScreenProps {}

export class OnBoardingSyncContactsScreen extends React.Component<
  OnBoardingSyncContactsScreenProps
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
        <Button onPress={() => navigate("OnBoardingSelectInfluencers")}>Sync Contacts</Button>
        <Button onPress={() => navigate("OnBoardingSelectInfluencers")}>Not Now</Button>
      </>
    )
  }
}
