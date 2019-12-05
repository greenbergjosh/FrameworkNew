import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { routes, styles, Units } from "constants"
import TouchText from "components/TouchText"
import { SettingsList } from "./components/SettingsList"
import { SettingRow, SettingRowProps } from "./components/SettingRow"
import { NOTIFICATIONS_DATA, SettingType } from "./components/mockData"
import { Text, View } from "react-native"
import { Colors } from "../../../constants/unit.constants"

interface NotificationsScreenProps extends NavigationTabScreenProps {}

export const NotificationsScreen = ({ navigation }: NotificationsScreenProps) => {
  const [settings, setSettings] = React.useState<SettingType[]>(NOTIFICATIONS_DATA)
  function handleSettingChange(setting, isChecked) {
    setSettings([...settings, setting])
  }

  return (
    <>
      <SettingRow
        value={{
          id: "bd7acbea-c1b1-46c2-aed5-3ad53abb2001",
          title: "Pause All",
          description: "",
          checked: false,
        }}
        style={{ margin: Units.margin }}
      />
      <View style={styles.ListHeader}>
        <Text style={styles.Body}>POSTS AND COMMENTS</Text>
      </View>
      <SettingsList values={settings} style={styles.View}>
        {({ value }) => (
          <View style={{ borderBottomWidth: 1, borderColor: Colors.grey, marginBottom: Units.margin }}>
            <SettingRow value={value} style={{ marginBottom: Units.margin / 2 }}/>
            <SettingRow
              value={{
                id: "bd7acbea-c1b1-46c2-aed5-3ad53abb2001",
                title: "Only people I follow",
                description: "",
                checked: false,
              }}
              style={{ marginLeft: Units.margin }}
              titleStyle={styles.SmallCopy}
            />
          </View>
        )}
      </SettingsList>
    </>
  )
}

NotificationsScreen.navigationOptions = ({ navigation }) => {
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
