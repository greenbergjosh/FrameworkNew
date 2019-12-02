import { Button, Icon } from "@ant-design/react-native"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors, routes } from "constants"
import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"

interface MessagesScreenProps extends NavigationStackScreenProps {}

export class MessagesScreen extends React.Component<MessagesScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: () => (
        <Button
          onPress={() => navigation.navigate(routes.Home.Feed)}
          style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
          <Icon name="arrow-left" color="#fff" size="lg" />
        </Button>
      ),
      headerTitle: () => <HeaderTitle title="Messages" />,
      headerRight: () => (
        <Button
          onPress={() => navigation.navigate(routes.Messages.NewMessage)}
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
        <Button
          onPress={() =>
            navigate(routes.Messages.ViewThread, { threadId: "abcde-fgh-ijkl-mnopqrst" })
          }>
          Navigate to Single Thread
        </Button>
      </>
    )
  }
}
