import React from "react"
import { Text } from "react-native"
import { Button, Toast } from "@ant-design/react-native"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors } from "constants"

interface NewMessageScreenProps extends NavigationStackScreenProps {}

export class NewMessageScreen extends React.Component<NewMessageScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: () => (
        <Button
          onPress={() => navigation.navigate("Messages")}
          style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
          <Text style={{ color: "#fff" }}>Cancel</Text>
        </Button>
      ),
      headerTitle: () => <HeaderTitle title="New Message" />,
      headerRight: () => (
        <Button
          onPress={() => navigation.navigate("Messages")}
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
        <Button onPress={() => Toast.info("This is a New Message toast")}>
          Show New Message Toast
        </Button>
      </>
    )
  }
}
