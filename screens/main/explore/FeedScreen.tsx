import React from "react"
import { ActivityIndicator, SearchBar } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { routes } from "constants"
import { ImageGrid } from "components/ImageGrid"
import { SafeAreaView, ScrollView } from "react-native"
import { BottomTabBar } from "components/BottomTabBar"
import { useFeedContext } from "data/feed.contextProvider"

type CampaignImageType = ImageType & {
  id: GUID
}

export interface FeedScreenProps extends NavigationTabScreenProps {}

export const FeedScreen = (props: FeedScreenProps) => {
  const { navigate } = props.navigation
  const feedContext = useFeedContext()
  const { exploreFeed } = feedContext

  const images: CampaignImageType[] = React.useMemo(() => {
    return !!exploreFeed ? exploreFeed.map((f) => ({ ...f.image, postId: f.id })) : []
  }, [exploreFeed])

  /*
   * Load Feed Dataxx
   */
  React.useMemo(() => {
    if (
      !feedContext.lastLoadExploreFeed &&
      !feedContext.loading.loadExploreFeed[JSON.stringify([])]
    ) {
      feedContext.loadExploreFeed()
      return <ActivityIndicator animating toast size="large" text="Loading..." />
    }
  }, [])

  if (!feedContext.lastLoadExploreFeed) {
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

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
          onItemPress={(postId) => navigate(routes.Explore.FeedDetails, { postId })}
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
