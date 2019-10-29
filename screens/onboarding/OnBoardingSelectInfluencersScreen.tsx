import { Button } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"

interface OnBoardingSelectInfluencersScreenProps extends NavigationSwitchScreenProps {}

export class OnBoardingSelectInfluencersScreen extends React.Component<
  OnBoardingSelectInfluencersScreenProps
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
        <Button onPress={() => navigate("Home")}>Done</Button>
      </>
    )
  }
}
