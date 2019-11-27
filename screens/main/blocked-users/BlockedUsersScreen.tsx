import { Button, Toast } from "@ant-design/react-native"
import React from "react"
import { Text } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
interface BlockedUsersScreenProps extends NavigationTabScreenProps {}
import { Colors, routes } from "constants"

export class BlockedUsersScreen extends React.Component<BlockedUsersScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: () => (
        <Button
          onPress={() => navigation.navigate(routes.Home.Feed)}
          style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
          <Text style={{ color: "#fff" }}>Cancel</Text>
        </Button>
      ),
      headerTitle: () => <HeaderTitle title="Blocked Users" />,
      headerRight: () => (
        <Button
          onPress={() => navigation.navigate(routes.Home.Feed)}
          style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
          <Text style={{ fontWeight: "bold", color: "#fff" }}>Done</Text>
        </Button>
      ),
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => Toast.info("This is a BlockedUsers toast")}>
          Show BlockedUsers Toast
        </Button>
      </>
    )
  }
}
