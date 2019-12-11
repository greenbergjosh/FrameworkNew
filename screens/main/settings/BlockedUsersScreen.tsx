import React from "react"
import { ActivityIndicator, Flex } from "@ant-design/react-native"
import { ScrollView, Text, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { routes, styles } from "constants"
import { useFollowsContext } from "providers/follows-context-provider"
import { BlockedUserRow } from "./components/BlockedUserRow"
import NavButton from "components/NavButton"

interface BlockedUsersScreenProps extends NavigationTabScreenProps {}

export const BlockedUsersScreen = ({ navigation }: BlockedUsersScreenProps) => {
  const followsContext = useFollowsContext()

  if (
    !followsContext.lastLoadBlockedUsers &&
    !followsContext.loading.loadBlockedUsers[JSON.stringify([])]
  ) {
    followsContext.loadBlockedUsers()
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  const blockedUsers = followsContext.blockedUsers
  return (
    <>
      {blockedUsers.length > 0 ? (
        <ScrollView
          style={{ flex: 1, backgroundColor: "#f5f5f9" }}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          <View style={{ backgroundColor: "white" }}>
            {blockedUsers.map((user) => (
              <BlockedUserRow key={user.id} user={user} />
            ))}
          </View>
        </ScrollView>
      ) : (
        <Flex justify="center" align="center" direction="column" style={{ flexGrow: 1 }}>
          <Text style={styles.Body}>You have not blocked anyone</Text>
        </Flex>
      )}
    </>
  )
}

BlockedUsersScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <NavButton onPress={() => navigation.navigate(routes.Home.Feed)} position="left">
        Cancel
      </NavButton>
    ),
    headerTitle: <HeaderTitle title="Blocked Users" />,
    headerRight: (
      <NavButton onPress={() => navigation.navigate(routes.Home.Feed)} position="right" type="primary">
        Done
      </NavButton>
    ),
  }
}
