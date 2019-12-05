import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { routes, styles, Units } from "constants"
import TouchText from "components/TouchText"
import { SettingsList } from "./components/SettingsList"
import { PRIVACYOPTIONS_DATA, SettingType } from "./components/mockData"

interface PrivacyOptionsScreenProps extends NavigationTabScreenProps {}

export const PrivacyOptionsScreen = ({ navigation }: PrivacyOptionsScreenProps) => {
  const [settings, setSettings] = React.useState<SettingType[]>(PRIVACYOPTIONS_DATA)
  function handleSettingChange(setting, isChecked) {
    setSettings([...settings, setting])
  }
  return <SettingsList values={settings} style={styles.ViewContainer} />
}

PrivacyOptionsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: () => (
      <TouchText
        onPress={() => navigation.navigate(routes.Home.Feed)}
        reverse
        size="lg"
        style={{ marginLeft: Units.margin }}>
        Cancel
      </TouchText>
    ),
    headerTitle: () => <HeaderTitle title="Privacy Options" />,
    headerRight: () => (
      <TouchText
        onPress={() => navigation.navigate(routes.Home.Feed)}
        reverse
        size="lg"
        type="primary"
        style={{ marginRight: Units.margin }}>
        Done
      </TouchText>
    ),
  }
}
