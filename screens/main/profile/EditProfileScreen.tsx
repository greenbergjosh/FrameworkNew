import React from "react"
import { ScrollView, Text } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import Avatar from "components/Avatar"
import { Flex } from "@ant-design/react-native"
import { Colors, routes, styles, Units } from "constants"
import { H2 } from "components/Markup"
import NavButton from "components/NavButton"
import { PROFILE_DATA } from "api/profile-services.mockData"
import { EditProfileForm } from "./components/EditProfileForm"

interface UserIdentityProps {
  user: UserType
  onPress: () => void
}

function UserIdentityPanel({ user, onPress }: UserIdentityProps) {
  return (
    <Flex
      direction="column"
      style={{ padding: Units.margin, backgroundColor: Colors.navBarBackground }}>
      <Avatar
        size="lg"
        source={user.avatarUri}
        style={{ marginBottom: Units.padding, position: "relative", overflow: "hidden" }}
        onPress={onPress}>
        <Text
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              textAlign: "center",
              backgroundColor: Colors.bodyTextEmphasis,
              color: Colors.reverse,
              fontSize: styles.SmallCopy.fontSize,
            },
          ]}>
          EDIT
        </Text>
      </Avatar>
      <H2>{user.name}</H2>
      <Text style={styles.Body}>{user.handle}</Text>
    </Flex>
  )
}

interface EditProfileScreenProps extends React.FunctionComponent, NavigationTabScreenProps {}

export const EditProfileScreen = ({ navigation }: EditProfileScreenProps) => {
  const { navigate } = navigation
  return (
    <>
      <UserIdentityPanel
        user={PROFILE_DATA}
        onPress={() => alert("Edit avatar photo\nFeature to come!")}
      />
      <ScrollView>
        <EditProfileForm user={PROFILE_DATA} style={{ margin: Units.margin }} />
      </ScrollView>
    </>
  )
}
EditProfileScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: <HeaderTitle title="Edit Profile" align="center" size="normal" />,
    headerLeft: (
      <NavButton onPress={() => navigation.navigate(routes.Profile.default)} position="left">
        Cancel
      </NavButton>
    ),
    headerRight: (
      <NavButton
        onPress={() => navigation.navigate(routes.Profile.default)}
        type="primary"
        position="right">
        Done
      </NavButton>
    ),
  }
}
