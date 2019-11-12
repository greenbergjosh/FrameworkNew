import * as Font from "expo-font"

import React, { useEffect } from "react"

import { AppLoading } from "expo"
import { AuthContextProvider } from "./providers/auth-context-provider"
import { AuthenticationSection } from "./screens/authentication/AuthenticationSection"
import { LandingScreen } from "./screens/landing/LandingScreen"
import { MainSection } from "./screens/main/MainSection"
import { OnBoardingSection } from "./screens/onboarding/OnBoardingSection"
import { Provider } from "@ant-design/react-native"
import { Transition } from "react-native-reanimated"
import createAnimatedSwitchNavigator from "react-navigation-animated-switch"
import { createAppContainer } from "react-navigation"

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

const App = () => {
  const [theme, setTheme] = React.useState(null)
  const [currentTheme, setCurrentTheme] = React.useState(null)
  const [isReady, setIsReady] = React.useState(false)

  const changeTheme = (theme, currentTheme) => {
    setTheme(theme);
    setCurrentTheme(currentTheme);
  }

  useEffect(() => {
    async function init() {
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
      setIsReady(true)
    }  
  
    init();
  }, []);
  
  if (!isReady) {
    return <AppLoading />
  }

  return (
    <AuthContextProvider>
      <Provider theme={theme}>
        <RootNavigator screenProps={{ changeTheme, currentTheme }} />
      </Provider>
    </AuthContextProvider>
  )
}

export default App;