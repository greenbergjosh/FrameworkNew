import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import {
  ActivityIndicator,
  Button,
  Card,
  Flex,
  SearchBar,
  Tag,
  WhiteSpace,
} from "@ant-design/react-native"
import Fuse from "fuse.js"
import { HeaderLogo } from "../../components/HeaderLogo"
import { ScrollView, Text, View } from "react-native"
import { FontWeights, routes, styles } from "constants"
import { useCatalogContext } from "providers/catalog-context-provider"
import { useProfileContext } from "providers/profile-context-provider"
import { Interest, InterestGroup } from "../../api/catalog-services"

interface OnBoardingSelectInterestsScreenProps extends NavigationSwitchScreenProps {}

interface InterestGroupsProps {
  value: InterestGroup[]
  onSelect: (isSelected: boolean, interest: Interest) => void
}

const InterestGroups = (props: InterestGroupsProps) => {
  const { value, onSelect } = props
  return (
    <>
      {value &&
        value.map((group) => (
          <Card key={group.id} full style={{ borderTopWidth: 0 }}>
            <WhiteSpace size="sm" />
            <Text style={[styles.H3, { fontWeight: FontWeights.bold }]}>{group.name}</Text>
            <WhiteSpace size="lg" />
            <Flex direction="row" wrap="wrap">
              {group.interests.map((interest) => (
                <Tag
                  key={interest.id}
                  style={{ marginRight: 10, marginBottom: 10 }}
                  onChange={(selected) => onSelect(selected, interest)}>
                  {interest.name}
                </Tag>
              ))}
            </Flex>
          </Card>
        ))}
    </>
  )
}

let fuseSearchableInterests: Fuse<
  Interest,
  {
    caseSensitive: boolean
    keys: string[]
    id: string
    threshold: number
  }
>

function createSearchableInterests(interests) {
  // Flatten interest groups
  let flatInterests: Interest[] = []
  interests.forEach((group) => {
    flatInterests = [...flatInterests, ...group.interests]
  })
  // Create searchable collection
  const options = {
    caseSensitive: false,
    keys: ["name", "description"],
    id: "id",
    threshold: 0.3,
  }
  return new Fuse(flatInterests, options)
}

export const OnBoardingSelectInterestsScreen = (props: OnBoardingSelectInterestsScreenProps) => {
  const { navigate } = props.navigation
  const [error, setError] = React.useState()
  const [selected, setSelected] = React.useState([])
  const [filteredInterests, setFilteredInterests] = React.useState<InterestGroup[]>([])
  const [isSaving, setIsSaving] = React.useState(false)
  const { lastLoadInterests, interests, loadInterests } = useCatalogContext()
  const profileContext = useProfileContext()

  React.useMemo(() => {
    loadInterests()
  }, [])

  React.useMemo(() => {
    setFilteredInterests(interests)
    fuseSearchableInterests = createSearchableInterests(interests)
  }, [interests])

  async function saveInterests() {
    setError(null)
    setIsSaving(true)
    try {
      const response = await profileContext.saveInterests(selected)
      setIsSaving(false)
      if (response.r !== 0) {
        setError(response.error)
      } else {
        navigate(routes.OnBoarding.SyncContacts)
      }
    } catch (ex) {
      setIsSaving(false)
    }
  }

  function handleSearch(pattern: string | void) {
    const trimPattern = pattern && pattern.trimStart()
    if (!trimPattern) {
      setFilteredInterests(interests)
      return
    }
    const results = fuseSearchableInterests.search<string>(trimPattern)

    // Filter the original interest groups
    const filtered = []
    const filterById = (item: Interest) => results.includes(item.id.toString())
    interests.forEach((group) => {
      const filteredGroup: InterestGroup = Object.assign({}, group)
      filteredGroup.interests = group.interests.filter(filterById)
      filtered.push(filteredGroup)
    })
    setFilteredInterests(filtered)
  }

  function handleSelect(isSelected, interest) {
    if (isSelected) {
      setSelected([...selected, interest])
    } else {
      const removeIdx = selected.findIndex((item) => item.id === interest.id)
      setSelected([...selected.splice(removeIdx)])
    }
  }

  return (
    <>
      {lastLoadInterests ? null : (
        <ActivityIndicator animating toast size="large" text="Loading..." />
      )}
      {!lastLoadInterests ? null : (
        <>
          <View style={styles.ViewContainer}>
            <Text style={styles.H2}>
              Pick your favorite interests to find people discussing them.
            </Text>
            <WhiteSpace size="lg" />
            <SearchBar
              placeholder="Search for interests"
              cancelText="Cancel"
              showCancelButton={false}
              onChange={handleSearch}
            />
            <WhiteSpace size="sm" />
          </View>
          <ScrollView style={[styles.View, { marginTop: 0, flex: 1 }]}>
            <InterestGroups value={filteredInterests} onSelect={handleSelect} />
          </ScrollView>
          <View style={styles.BottomButtonBar}>
            <Button
              type="ghost"
              style={styles.LinkButton}
              onPress={() => navigate(routes.OnBoarding.SyncContacts)}
              disabled={isSaving}>
              Skip
            </Button>
            <Button
              type="ghost"
              style={styles.LinkButton}
              onPress={saveInterests}
              loading={isSaving}>
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
