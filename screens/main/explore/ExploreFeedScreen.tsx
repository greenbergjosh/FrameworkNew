import React from "react"
import { SearchBar } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { FEED_DATA } from "./components/mockData"
import FeedList from "./components/FeedList"
import { routes } from "constants"

interface ExploreFeedScreenProps extends NavigationTabScreenProps {}

export class ExploreFeedScreen extends React.Component<ExploreFeedScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Explore" align="left" size="large" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { feed } = FEED_DATA
    return (
      <>
        <SearchBar
          placeholder="Search"
          cancelText="Cancel"
          showCancelButton={false}
          onSubmit={() => alert("Search\n Feature to come!")}
        />
        <FeedList
          feed={feed}
          onPress={(id) => navigate(routes.Explore.FeedDetails, { id })}
        />
      </>
    )
  }
}
