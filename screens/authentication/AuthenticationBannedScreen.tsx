import { Button } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"

interface AuthenticationBannedScreenProps extends NavigationSwitchScreenProps {}

export class AuthenticationBannedScreen extends React.Component<AuthenticationBannedScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => navigate("Landing")}>Sign Out</Button>
      </>
    )
  }
}
