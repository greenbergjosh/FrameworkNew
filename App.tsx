import { Provider } from "@ant-design/react-native"
import { ActionSheetProvider } from "@expo/react-native-action-sheet"
import { AppLoading } from "expo"
import * as Font from "expo-font"
import React, { useEffect } from "react"
import { Transition } from "react-native-reanimated"
import { createAppContainer } from "react-navigation"
import createAnimatedSwitchNavigator from "react-navigation-animated-switch"
import { GetGotRootDataContextProvider } from "./providers/getgot-root-data-context-provider"
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

const App = () => {
  const [theme, setTheme] = React.useState(null)
  const [currentTheme, setCurrentTheme] = React.useState(null)
  const [isReady, setIsReady] = React.useState(false)

  const changeTheme = (theme, currentTheme) => {
    setTheme(theme)
    setCurrentTheme(currentTheme)
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

    init()
  }, [])

  if (!isReady) {
    return <AppLoading />
  }

  return (
    <GetGotRootDataContextProvider>
      <Provider theme={theme}>
        <ActionSheetProvider>
          <RootNavigator
            screenProps={{ changeTheme, currentTheme }}
            onNavigationStateChange={(prevState, currentState, action) => {
              const currentRouteName = getActiveRouteName(currentState)
              const previousRouteName = getActiveRouteName(prevState)

              if (previousRouteName !== currentRouteName) {
                // TODO Event and Analytics tracking
                // the line below uses the @react-native-firebase/analytics tracker
                // change the tracker here to use other Mobile analytics SDK.
                // analytics().setCurrentScreen(currentRouteName, currentRouteName)
              }
            }}
          />
        </ActionSheetProvider>
      </Provider>
    </GetGotRootDataContextProvider>
  )
}

export default App

// SEE: https://reactnavigation.org/docs/en/screen-tracking.html
// gets the current screen from navigation state
function getActiveRouteName(navigationState) {
  if (!navigationState) {
    return null
  }
  const route = navigationState.routes[navigationState.index]
  // dive into nested navigators
  if (route.routes) {
    return getActiveRouteName(route)
  }
  return route.routeName
}
