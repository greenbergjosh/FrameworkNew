import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors, routes, styles, Units } from "constants"
import { SettingsList } from "./components/SettingsList"
import { SettingRow } from "./components/SettingRow"
import { SettingType } from "data/api/profile.services"
import { SafeAreaView, Text, View } from "react-native"
import NavButton from "components/NavButton"
import { useAuthContext } from "data/auth.contextProvider"
import { useProfileContext } from "data/profile.contextProvider"
import { ActivityIndicator } from "@ant-design/react-native"

interface NotificationsScreenProps extends NavigationTabScreenProps {}

export const NotificationsScreen = ({ navigation }: NotificationsScreenProps) => {
  const authContext = useAuthContext()
  const profileContext = useProfileContext()
  const { notificationSettings } = profileContext
  const [settings, setSettings] = React.useState<SettingType[]>([])

  React.useMemo(() => {
    if (profileContext.lastLoadNotificationSettings) {
      setSettings(notificationSettings)
    }
  }, [notificationSettings])

  if (
    !profileContext.lastLoadNotificationSettings &&
    !profileContext.loading.loadNotificationSettings[JSON.stringify([authContext.id])]
  ) {
    profileContext.loadNotificationSettings(authContext.id)
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

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
      <SettingsList values={notificationSettings} style={{ margin: Units.margin }}>
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
    headerTitle: <HeaderTitle title="Notifications" />,
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
