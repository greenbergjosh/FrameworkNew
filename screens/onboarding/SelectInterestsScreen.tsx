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
import { HeaderLogo } from "components/HeaderLogo"
import { H2, H3, P } from "components/Markup"
import { ScrollView, Text, View } from "react-native"
import { FontWeights, routes, styles, Units } from "constants"
import { useCatalogContext } from "data/contextProviders/catalog.contextProvider"
import { useProfileContext } from "data/contextProviders/profile.contextProvider"
import { InterestType, InterestGroupType } from "data/api/catalog"

interface SelectInterestsScreenProps extends NavigationSwitchScreenProps {}

interface InterestGroupsProps {
  value: InterestGroupType[]
  onSelect: (isSelected: boolean, interest: InterestType) => void
}

const InterestGroups = (props: InterestGroupsProps) => {
  const { value, onSelect } = props
  return (
    <>
      {value &&
        value.map((group) => (
          <Card key={group.id} full style={{ borderTopWidth: 0 }}>
            <WhiteSpace size="sm" />
            <H3 style={[{ fontWeight: FontWeights.bold }]}>{group.name}</H3>
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
  InterestType,
  {
    caseSensitive: boolean
    keys: string[]
    id: string
    threshold: number
  }
>

function createSearchableInterests(interests) {
  // Flatten interest groups
  let flatInterests: InterestType[] = []
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

export const SelectInterestsScreen = (props: SelectInterestsScreenProps) => {
  const { navigate } = props.navigation
  const [error, setError] = React.useState()
  const [selected, setSelected] = React.useState([])
  const [filteredInterests, setFilteredInterests] = React.useState<InterestGroupType[]>([])
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
    const filterById = (item: InterestType) => results.includes(item.id.toString())
    interests.forEach((group) => {
      const filteredGroup: InterestGroupType = Object.assign({}, group)
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
            <H2>
              Pick your favorite interests to find people discussing them.
            </H2>
            <WhiteSpace size="lg" />
            <SearchBar
              placeholder="Search for interests"
              cancelText="Cancel"
              showCancelButton={false}
              onChange={handleSearch}
            />
            <WhiteSpace size="sm" />
          </View>
          <ScrollView style={{ margin: Units.margin, marginTop: 0, flex: 1 }}>
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

SelectInterestsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
