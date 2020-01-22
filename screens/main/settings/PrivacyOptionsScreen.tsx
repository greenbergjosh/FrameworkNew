import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { routes, styles } from "constants"
import { SettingsList } from "./components/SettingsList"
import { SettingType } from "data/api/profile.services"
import NavButton from "components/NavButton"
import { SafeAreaView } from "react-native"
import { useProfileContext } from "data/profile.contextProvider"
import { ActivityIndicator } from "@ant-design/react-native"
import { useAuthContext } from "data/auth.contextProvider"

interface PrivacyOptionsScreenProps extends NavigationTabScreenProps {}

export const PrivacyOptionsScreen = ({ navigation }: PrivacyOptionsScreenProps) => {
  const authContext = useAuthContext()
  const profileContext = useProfileContext()
  const { privacyOptions } = profileContext
  // const [settings, setSettings] = React.useState<SettingType[]>([])

  if (
    !profileContext.lastLoadPrivacyOptions &&
    !profileContext.loading.loadPrivacyOptions[JSON.stringify([authContext.id])]
  ) {
    profileContext.loadPrivacyOptions(authContext.id)
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  function handleSettingChange(setting, isChecked) {
    // setSettings([...settings, setting])
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SettingsList values={privacyOptions} style={styles.ViewContainer} />
    </SafeAreaView>
  )
}

PrivacyOptionsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <NavButton onPress={() => navigation.navigate(routes.Home.Feed)} position="left">
        Cancel
      </NavButton>
    ),
    headerTitle: <HeaderTitle title="Privacy Options" />,
    headerRight: (
      <NavButton
        onPress={() => navigation.navigate(routes.Home.Feed)}
        type="primary"
        position="right">
        Done
      </NavButton>
    ),
  }
}
