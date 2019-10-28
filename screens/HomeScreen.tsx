import { IconFill } from "@ant-design/icons-react-native"
import { Button, Icon, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { HeaderLogo } from "../components/HeaderLogo"

interface HomeScreenProps extends NavigationStackScreenProps {}

export class HomeScreen extends React.Component<HomeScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: () => (
        <Button
          onPress={navigation.getParam("increaseCount")}
          style={{ backgroundColor: "#343997", borderWidth: 0 }}
        >
          <Icon name="menu" size="md" color="#fff" />
        </Button>
      ),

      headerTitle: () => <HeaderLogo />,
      headerRight: () => (
        <Button
          onPress={navigation.getParam("increaseCount")}
          style={{ backgroundColor: "#343997", borderWidth: 0 }}
        >
          <IconFill name="mail" color="#fff" />
        </Button>
      )
    };
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <>
        <Button onPress={() => navigate("Profile", { name: "Jane" })}>
          Go To Wherever
        </Button>
        <Button onPress={() => Toast.info("This is a toast tips")}>
          Start
        </Button>
      </>
    );
  }
}
