import React from "react"
import { SearchBar } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import * as mockData from "data/api/feed.services.mockData"
import { routes } from "constants"
import { ImageGrid } from "components/ImageGrid"
import { SafeAreaView, ScrollView } from "react-native"
import { BottomTabBar } from "components/BottomTabBar"

export interface FeedScreenProps extends NavigationTabScreenProps {}

export const FeedScreen = (props: FeedScreenProps) => {
  const { navigate } = props.navigation
  const { feed } = mockData.FEED_DATA
  const images = React.useMemo(() => feed.map((f) => f.image), [feed])
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SearchBar
        placeholder="Search"
        cancelText="Cancel"
        showCancelButton={false}
        onSubmit={() => alert("Search\n Feature to come!")}
      />
      <ScrollView>
        <ImageGrid
          images={images}
          onItemPress={(id) => navigate(routes.Explore.FeedDetails, { id })}
        />
      </ScrollView>
      <BottomTabBar activeTab={routes.Explore.default} />
    </SafeAreaView>
  )
}
FeedScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: null,
    headerTitle: () => <HeaderTitle title="Explore" align="left" size="large" />,
  }
}
