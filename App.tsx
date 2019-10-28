import { Provider } from "@ant-design/react-native"
import { AppLoading } from "expo"
import * as Font from "expo-font"
import React from "react"
import { createAppContainer } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { HomeScreen } from "./screens/HomeScreen"

const stackNavigator = createStackNavigator(
  {
    // TODO: Need these in the RootNavigator
    // Landing Screen
    // OnBoarding Root
    // Authentication Root
    // Home Root

    Home: { screen: HomeScreen }
    // Profile: {screen: ProfileScreen},
  },
  {
    initialRouteName: "Home",
    /* The header config from HomeScreen is now here */
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: "#343997"
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold"
      }
    }
  }
);
const RootNavigator = createAppContainer(stackNavigator);

export default class App extends React.Component {
  state = {
    theme: null,
    currentTheme: null,
    isReady: false
  };
  changeTheme = (theme, currentTheme) => {
    this.setState({ theme, currentTheme });
  };
  async componentDidMount() {
    await Font.loadAsync(
      "antoutline",
      // eslint-disable-next-line
      require("@ant-design/icons-react-native/fonts/antoutline.ttf")
    );

    await Font.loadAsync(
      "antfill",
      // eslint-disable-next-line
      require("@ant-design/icons-react-native/fonts/antfill.ttf")
    );
    // eslint-disable-next-line
    this.setState({ isReady: true });
  }
  render() {
    const { theme, currentTheme, isReady } = this.state;
    if (!isReady) {
      return <AppLoading />;
    }
    return (
      <Provider theme={theme}>
        <RootNavigator
          screenProps={{ changeTheme: this.changeTheme, currentTheme }}
        />
      </Provider>
    );
  }
}
