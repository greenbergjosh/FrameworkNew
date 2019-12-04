import React from "react"
import { SearchBar } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { mockData, FeedGrid } from "components/feed"
import { routes } from "constants"

export interface ExploreFeedScreenProps extends NavigationTabScreenProps {}

export class ExploreFeedScreen extends React.Component<ExploreFeedScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
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
        <FeedGrid feed={feed} onPress={(id) => navigate(routes.Explore.FeedDetails, { id })} />
      </>
    )
  }
}
