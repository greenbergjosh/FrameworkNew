import {
  ActivityIndicator,
  Button,
  Card,
  Flex,
  SearchBar,
  Tag,
  WhiteSpace,
} from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"
import { ScrollView, Text, View } from "react-native"
import { FontWeights, routes, styles } from "constants"
import { useCatalogContext } from "providers/catalog-context-provider"
import { useProfileContext } from "providers/profile-context-provider"

interface OnBoardingSelectInterestsScreenProps extends NavigationSwitchScreenProps {}

const InterestGroups = ({ value }) => (
  <>
    {value &&
      value.map((group) => (
        <Card key={group.id} full style={{ borderTopWidth: 0 }}>
          <WhiteSpace size="sm" />
          <Text style={[styles.H3, { fontWeight: FontWeights.bold }]}>{group.name}</Text>
          <WhiteSpace size="lg" />
          <Flex direction="row" wrap="wrap">
            {group.interests.map((interest) => (
              <Tag key={interest.id} style={{ marginRight: 10, marginBottom: 10 }}>
                {interest.name}
              </Tag>
            ))}
          </Flex>
        </Card>
      ))}
  </>
)

export const OnBoardingSelectInterestsScreen = (props: OnBoardingSelectInterestsScreenProps) => {
  const [error, setError] = React.useState()
  const [isWaiting, setWaiting] = React.useState(false)
  const { navigate } = props.navigation

  // Load Interests
  const catalogContext = useCatalogContext()
  if (!catalogContext.lastLoadInterests) {
    catalogContext.loadInterests()
    // return <ActivityIndicator animating toast size="large" text="Loading..." />
  }
  const interests = catalogContext.interests

  // Save Interests
  const profileContext = useProfileContext()

  async function saveInterests() {
    setError(null)
    setWaiting(true)
    try {
      const userInterests = []
      const response = await profileContext.saveInterests(userInterests)
      setWaiting(false)
      if (response.r !== 0) {
        setError(response.error)
      } else {
        navigate(routes.OnBoarding.SyncContacts)
      }
    } catch (ex) {
      setWaiting(false)
    }
  }

  return (
    <>
      {catalogContext.lastLoadInterests ? null : (
        <ActivityIndicator animating toast size="large" text="Loading..." />
      )}
      {!catalogContext.lastLoadInterests ? null : (
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
            <InterestGroups value={interests} />
          </ScrollView>
          <View style={styles.BottomButtonBar}>
            <Button
              type="ghost"
              style={styles.LinkButton}
              onPress={() => navigate(routes.OnBoarding.SyncContacts)}
              disabled={isWaiting}>
              Skip
            </Button>
            <Button
              type="ghost"
              style={styles.LinkButton}
              onPress={saveInterests}
              loading={isWaiting}>
              Done
            </Button>
          </View>
        </>
      )}
    </>
  )
}

OnBoardingSelectInterestsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
  }
}
