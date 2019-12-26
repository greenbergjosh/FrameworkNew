import React from "react"
import { SearchBar } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import * as mockData from "api/feed-services.mockData"
import { routes } from "constants"
import { ImageGrid } from "components/ImageGrid"
import { ScrollView } from "react-native"

export interface ExploreFeedScreenProps extends NavigationTabScreenProps {}

export const ExploreFeedScreen = (props: ExploreFeedScreenProps) => {
  const { navigate } = props.navigation
  const { feed } = mockData.FEED_DATA
  const images = React.useMemo(() => feed.map((f) => f.image), [feed])
  return (
    <>
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
    </>
  )
}
ExploreFeedScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: null,
    headerTitle: () => <HeaderTitle title="Explore" align="left" size="large" />,
  }
}
