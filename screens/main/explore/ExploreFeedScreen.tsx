import React from "react"
import { Grid, SearchBar } from "@ant-design/react-native"
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors, ImageUris, routes } from "constants"

interface ExploreFeedScreenProps extends NavigationTabScreenProps {}

const FEED_DATA = {
  feed: [
    { src: ImageUris.placeholder, id: "1" },
    { src: ImageUris.placeholder, id: "2" },
    { src: ImageUris.placeholder, id: "3" },
    { src: ImageUris.placeholder, id: "4" },
    { src: ImageUris.placeholder, id: "5" },
    { src: ImageUris.placeholder, id: "6" },
    { src: ImageUris.placeholder, id: "7" },
    { src: ImageUris.placeholder, id: "8" },
    { src: ImageUris.placeholder, id: "9" },
    { src: ImageUris.placeholder, id: "10" },
    { src: ImageUris.placeholder, id: "11" },
    { src: ImageUris.placeholder, id: "12" },
    { src: ImageUris.placeholder, id: "13" },
    { src: ImageUris.placeholder, id: "14" },
    { src: ImageUris.placeholder, id: "15" },
    { src: ImageUris.placeholder, id: "16" },
    { src: ImageUris.placeholder, id: "17" },
    { src: ImageUris.placeholder, id: "18" },
    { src: ImageUris.placeholder, id: "19" },
    { src: ImageUris.placeholder, id: "20" },
    { src: ImageUris.placeholder, id: "21" },
    { src: ImageUris.placeholder, id: "22" },
    { src: ImageUris.placeholder, id: "23" },
    { src: ImageUris.placeholder, id: "24" },
    { src: ImageUris.placeholder, id: "25" },
    { src: ImageUris.placeholder, id: "26" },
    { src: ImageUris.placeholder, id: "27" },
  ],
}

function FeedImage({ src, id, onPress }) {
  return (
    <View
      style={{
        margin: 3,
        borderColor: Colors.grey,
        borderWidth: 1,
        flex: 1,
      }}>
      <TouchableOpacity onPress={onPress}>
        <Image source={{ uri: src }} style={{ flex: 1, height: 120 }} />
      </TouchableOpacity>
    </View>
  )
}

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
          onSubmit={() => alert("Search to come!")}
        />
        <ScrollView>
          <FlatList
            data={feed}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FeedImage
                src={item.src}
                id={item.id}
                onPress={() => navigate(routes.Explore.UserFeed, { id: item.id })}
              />
            )}
            numColumns={3}
          />
        </ScrollView>
      </>
    )
  }
}
