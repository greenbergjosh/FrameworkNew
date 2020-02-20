import React from "react"
import { SafeAreaView, ScrollView, Text } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import Avatar from "components/Avatar"
import { ActivityIndicator, Flex } from "@ant-design/react-native"
import { routes } from "routes"
import { Colors, styles, Units } from "styles"
import { H2 } from "components/Markup"
import NavButton from "components/NavButton"
import { EditProfileForm } from "./components/EditProfileForm"
import {
  PhotoSelectStatus,
  useActionSheetTakeSelectPhoto,
} from "hooks/useActionSheetTakeSelectPhoto"
import { useProfileContext } from "data/contextProviders/profile.contextProvider"

interface UserIdentityProps {
  user: UserType
  onPress: () => void
}

function UserIdentityPanel({ user, onPress }: UserIdentityProps) {
  const [avatarSrc, setAvatarSrc] = React.useState<string>(null)

  const editAvatar = useActionSheetTakeSelectPhoto((imageResult, promptKey: string = "photo") => {
    if (imageResult.status === PhotoSelectStatus.PERMISSION_NOT_GRANTED) {
      alert("Sorry, GetGot needs your permission to enable selecting this photo!")
    } else if (imageResult.status === PhotoSelectStatus.SUCCESS) {
      const imageBase64 = imageResult.base64
      setAvatarSrc(imageBase64)
      // TODO: Save avatar to api
    }
  })

  React.useMemo(() => setAvatarSrc(user.avatarUri), [])

  return (
    <Flex
      direction="column"
      style={{ padding: Units.margin, backgroundColor: Colors.navBarBackground }}>
      <Avatar
        size="lg"
        source={avatarSrc}
        style={{ marginBottom: Units.padding, position: "relative", overflow: "hidden" }}
        onPress={editAvatar}>
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

export const EditProfileScreen = ({}: EditProfileScreenProps) => {
  const profileContext = useProfileContext()
  if (
    !profileContext.lastLoadProfile &&
    !profileContext.loading.loadProfile[JSON.stringify([])]
  ) {
    profileContext.loadProfile()
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }
  const { profile } = profileContext

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <UserIdentityPanel
        user={profile as UserType}
        onPress={() => alert("Edit avatar photo\nFeature to come!")}
      />
      <ScrollView>
        <EditProfileForm profile={profile} style={{ margin: Units.margin }} />
      </ScrollView>
    </SafeAreaView>
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
