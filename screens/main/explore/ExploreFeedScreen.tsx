import React from "react"
import { SearchBar } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import * as mockData from "api/feed-services.mockData"
import { routes } from "constants"
import { ImageGrid } from "components/ImageGrid"
import { ScrollView } from "react-native"

export interface ExploreFeedScreenProps extends NavigationTabScreenProps {}

export class ExploreFeedScreen extends React.Component<ExploreFeedScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: null,
      headerTitle: () => <HeaderTitle title="Explore" align="left" size="large" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { feed } = mockData.FEED_DATA
    return (
      <>
        <SearchBar
          placeholder="Search"
          cancelText="Cancel"
          showCancelButton={false}
          onSubmit={() => alert("Search\n Feature to come!")}
        />
        <ScrollView>
          <ImageGrid images={feed} onPress={(id) => navigate(routes.Explore.FeedDetails, { id })} />
        </ScrollView>
      </>
    )
  }
}
