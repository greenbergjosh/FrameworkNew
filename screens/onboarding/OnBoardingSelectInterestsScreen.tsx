import { Button, Card, Flex, SearchBar, Tag, WhiteSpace } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"
import { ScrollView, Text, View } from "react-native"
import { FontWeights, styles } from "constants"

interface OnBoardingSelectInterestsScreenProps extends NavigationSwitchScreenProps {}

const interests = {
  Sports: ["Football", "Baseball", "Soccer", "Basketball"],
  Arts: ["Music", "Painting", "Reading", "Woodworking"],
  Culture: ["Traveling", "Cooking"],
  Technology: ["Blogging", "Gaming"],
  Community: ["Volunteer Work", "Community Involvement"],
}

const Interests = () => (
  <>
    {Object.keys(interests).map((topic) => (
      <Card key={topic} full style={{ borderTopWidth: 0 }}>
        <WhiteSpace size="sm" />
        <Text style={[styles.H3, { fontWeight: FontWeights.bold }]}>{topic}</Text>
        <WhiteSpace size="lg" />
        <Flex direction="row" wrap="wrap">
          {interests[topic].map((interest) => (
            <Tag key={interest} style={{ marginRight: 10, marginBottom: 10 }}>
              {interest}
            </Tag>
          ))}
        </Flex>
      </Card>
    ))}
  </>
)

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
          <Interests />
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
