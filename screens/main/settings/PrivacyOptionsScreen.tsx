import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { routes, styles } from "constants"
import { SettingsList } from "./components/SettingsList"
import { PRIVACYOPTIONS_DATA } from "api/profile-services.mockData"
import { SettingType } from "api/profile-services"
import NavButton from "components/NavButton"
import { SafeAreaView } from "react-native"

interface PrivacyOptionsScreenProps extends NavigationTabScreenProps {}

export const PrivacyOptionsScreen = ({ navigation }: PrivacyOptionsScreenProps) => {
  const [settings, setSettings] = React.useState<SettingType[]>(PRIVACYOPTIONS_DATA)
  function handleSettingChange(setting, isChecked) {
    setSettings([...settings, setting])
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SettingsList values={settings} style={styles.ViewContainer} />
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
