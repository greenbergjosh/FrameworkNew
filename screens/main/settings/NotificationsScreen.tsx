import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors, routes, styles, Units } from "constants"
import { SettingsList } from "./components/SettingsList"
import { SettingRow } from "./components/SettingRow"
import { NOTIFICATIONS_DATA } from "data/api/profile.services.mockData"
import { SettingType } from "data/api/profile.services"
import { SafeAreaView, Text, View } from "react-native"
import NavButton from "components/NavButton"

interface NotificationsScreenProps extends NavigationTabScreenProps {}

export const NotificationsScreen = ({ navigation }: NotificationsScreenProps) => {
  const [settings, setSettings] = React.useState<SettingType[]>(NOTIFICATIONS_DATA)
  function handleSettingChange(setting, isChecked) {
    setSettings([...settings, setting])
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SettingRow
        value={{
          id: "bd7acbea-c1b1-46c2-aed5-3ad53abb2001",
          title: "Pause All",
          description: "",
          checked: false,
        }}
        style={{ margin: Units.margin }}
      />
      <View style={styles.SubHeader}>
        <Text style={styles.Body}>POSTS AND COMMENTS</Text>
      </View>
      <SettingsList values={settings} style={styles.View}>
        {({ value }) => (
          <View
            style={{
              borderBottomWidth: 1,
              borderColor: Colors.border,
              marginBottom: Units.margin,
            }}>
            <SettingRow value={value} style={{ marginBottom: Units.margin / 2 }} />
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
    </SafeAreaView>
  )
}

NotificationsScreen.navigationOptions = ({ navigation }) => {
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
