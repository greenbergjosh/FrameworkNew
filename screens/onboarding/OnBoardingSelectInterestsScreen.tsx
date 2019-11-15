import { Button, Card, Flex, SearchBar, Tag, WhiteSpace } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"
import { ScrollView, Text, View, ViewStyle } from "react-native"
import { Colors, FontWeights, styles } from "constants"
import { TagStyle } from "@ant-design/react-native/es/tag/style"

interface OnBoardingSelectInterestsScreenProps extends NavigationSwitchScreenProps {}

export class OnBoardingSelectInterestsScreen extends React.Component<
  OnBoardingSelectInterestsScreenProps
> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <View style={styles.ViewContainer}>
          <Text style={styles.H2}>
            Pick your favorite interests to find people discussing them.
          </Text>
          <WhiteSpace size="lg" />
          <SearchBar placeholder="Search for interests" cancelText="Cancel" />
          <WhiteSpace size="sm" />
        </View>
        <ScrollView style={[styles.View, { marginTop: 0, flex: 1 }]}>
          <Card full style={{ borderTopWidth: 0 }}>
            <Text style={[styles.H3, { fontWeight: FontWeights.bold }]}>Topic Name</Text>
            <WhiteSpace size="lg" />
            <Flex direction="row" wrap="wrap">
              <Tag style={{ marginRight: 10, marginBottom: 10 }}>Topic One</Tag>
              <Tag selected style={{ marginRight: 10, marginBottom: 10 }}>
                Topic Two
              </Tag>
              <Tag style={{ marginRight: 10, marginBottom: 10 }}>Topic Three</Tag>
              <Tag style={{ marginRight: 10, marginBottom: 10 }}>Topic Four</Tag>
              <Tag style={{ marginRight: 10, marginBottom: 10 }}>Topic Five</Tag>
            </Flex>
            <WhiteSpace size="sm" />
          </Card>
        </ScrollView>
        <View style={styles.BottomButtonBar}>
          <Button
            type="ghost"
            style={styles.LinkButton}
            onPress={() => navigate("OnBoardingSyncContacts")}>
            Skip
          </Button>
          <Button
            type="ghost"
            style={styles.LinkButton}
            onPress={() => navigate("OnBoardingSyncContacts")}>
            Done
          </Button>
        </View>
      </>
    )
  }
}
