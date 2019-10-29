import { Provider } from "@ant-design/react-native"
import { AppLoading } from "expo"
import * as Font from "expo-font"
import React from "react"
import { Transition } from "react-native-reanimated"
import { createAppContainer } from "react-navigation"
import createAnimatedSwitchNavigator from "react-navigation-animated-switch"
import { AuthenticationSection } from "./screens/authentication/AuthenticationSection"
import { LandingScreen } from "./screens/landing/LandingScreen"
import { MainSection } from "./screens/main/MainSection"
import { OnBoardingSection } from "./screens/onboarding/OnBoardingSection"

const sectionNavigator = createAnimatedSwitchNavigator(
  {
    Landing: { screen: LandingScreen },
    OnBoarding: { screen: OnBoardingSection },
    Authentication: { screen: AuthenticationSection },
    Main: { screen: MainSection },
  },
  {
    initialRouteName: "Landing",
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: "#343997",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    },
    transition: (
      <Transition.Together>
        <Transition.Out type="slide-bottom" durationMs={400} interpolation="easeIn" />
        <Transition.In type="fade" durationMs={500} />
      </Transition.Together>
    ),
  }
)
const RootNavigator = createAppContainer(sectionNavigator)

export default class App extends React.Component {
  state = {
    theme: null,
    currentTheme: null,
    isReady: false,
  }
  changeTheme = (theme, currentTheme) => {
    this.setState({ theme, currentTheme })
  }
  async componentDidMount() {
    await Font.loadAsync(
      "antoutline",
      // eslint-disable-next-line
      require("@ant-design/icons-react-native/fonts/antoutline.ttf")
    )

    await Font.loadAsync(
      "antfill",
      // eslint-disable-next-line
      require("@ant-design/icons-react-native/fonts/antfill.ttf")
    )
    // eslint-disable-next-line
    this.setState({ isReady: true })
  }
  render() {
    const { theme, currentTheme, isReady } = this.state
    if (!isReady) {
      return <AppLoading />
    }
    return (
      <Provider theme={theme}>
        <RootNavigator screenProps={{ changeTheme: this.changeTheme, currentTheme }} />
      </Provider>
    )
  }
}
