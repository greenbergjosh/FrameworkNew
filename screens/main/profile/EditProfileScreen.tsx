import React from "react"
import { ScrollView, Text, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import Avatar from "components/Avatar"
import { Flex, InputItem, WhiteSpace } from "@ant-design/react-native"
import { routes, styles, Units, Colors } from "constants"
import TouchText from "components/TouchText"
import { P, A, BR, H2, H3, H4, STRONG, SMALL } from "components/Markup"

interface EditProfileScreenProps extends React.FunctionComponent, NavigationTabScreenProps {}

function UserIdentity(props: { onPress: () => void }) {
  return (
    <Flex direction="column" style={{ padding: Units.margin, backgroundColor: Colors.lightgrey }}>
      <Avatar
        size="lg"
        style={{ marginBottom: Units.padding, position: "relative", overflow: "hidden" }}
        onPress={props.onPress}>
        <Text
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              textAlign: "center",
              backgroundColor: Colors.black,
              color: Colors.white,
              fontSize: styles.SmallCopy.fontSize,
            },
          ]}>
          EDIT
        </Text>
      </Avatar>
      <H2>Sarah Puffinpots</H2>
      <Text style={styles.Body}>sarah.p</Text>
    </Flex>
  )
}

function ProfileForm({ style }) {
  return (
    <View style={style}>
      <H4>Name</H4>
      <InputItem
        type="text"
        name="name"
        value=""
        placeholder="Your full name"
        clearButtonMode="always"
      />
      <WhiteSpace size="lg" />
      <H4>Username</H4>
      <InputItem
        type="text"
        name="username"
        value=""
        placeholder="Your username"
        clearButtonMode="always"
      />
      <WhiteSpace size="lg" />
      <H4>Website</H4>
      <InputItem
        type="text"
        name="website"
        value=""
        placeholder="Your website"
        clearButtonMode="always"
      />
      <WhiteSpace size="lg" />
      <H4>About You</H4>
      <InputItem
        type="text"
        name="about"
        value=""
        placeholder="Describe yourself"
        clearButtonMode="always"
      />
      <WhiteSpace size="xl" />
      <H3>Private Information</H3>
      <WhiteSpace size="lg" />
      <H4>Email</H4>
      <InputItem
        type="text"
        name="email"
        value=""
        placeholder="Your email address"
        clearButtonMode="always"
      />
      <WhiteSpace size="lg" />
      <H4>Phone</H4>
      <InputItem
        type="text"
        name="phone"
        value=""
        placeholder="Your phone number"
        clearButtonMode="always"
      />
      <WhiteSpace size="lg" />
      <H4>Gender</H4>
      <InputItem
        type="text"
        name="gender"
        value=""
        placeholder="Your gender"
        clearButtonMode="always"
      />
      <WhiteSpace size="lg" />
      <H4>Birthday</H4>
      <InputItem
        type="text"
        name="birthday"
        value=""
        placeholder="Your birthday"
        clearButtonMode="always"
      />
    </View>
  )
}

export const EditProfileScreen = ({ navigation }: EditProfileScreenProps) => {
  const { navigate } = navigation
  return (
    <>
      <UserIdentity onPress={() => alert("Edit avatar photo\nFeature to come!")} />
      <ScrollView>
        <ProfileForm style={{ margin: Units.margin }} />
      </ScrollView>
    </>
  )
}
EditProfileScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderTitle title="Edit Profile" align="center" size="normal" />,
    headerLeft: () => (
      <TouchText
        onPress={() => navigation.navigate(routes.Profile.default)}
        reverse
        size="lg"
        style={{ marginLeft: Units.margin }}>
        Cancel
      </TouchText>
    ),
    headerRight: () => (
      <TouchText
        onPress={() => navigation.navigate(routes.Profile.default)}
        reverse
        size="lg"
        type="primary"
        style={{ marginRight: Units.margin }}>
        Done
      </TouchText>
    ),
  }
}
