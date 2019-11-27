import { Button, Icon } from "@ant-design/react-native"
import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors } from "constants"

interface MessagesScreenProps extends NavigationStackScreenProps {}

export class MessagesScreen extends React.Component<MessagesScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Messages" />,
      headerRight: () => (
        <Button
          onPress={() => navigation.navigate("NewMessage")}
          style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
          <Icon name="plus" color="#fff" size="lg" />
        </Button>
      ),
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => navigate("ViewThread", { threadId: "abcde-fgh-ijkl-mnopqrst" })}>
          Navigate to Single Thread
        </Button>
      </>
    )
  }
}
