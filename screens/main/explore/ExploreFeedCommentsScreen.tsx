import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import * as mockData from "api/feed-services.mockData"
import NavButton from "components/NavButton"
import { Comments } from "components/feed"
import { influencerFeedRoutes, styles } from "constants"
import { SafeAreaView, ScrollView } from "react-native"
import { CommentKeyboard } from "components/feed/CommentKeyboard"

export interface ExploreFeedCommentsScreenProps extends NavigationTabScreenProps {}

export const ExploreFeedCommentsScreen = (props: ExploreFeedCommentsScreenProps) => {
  const { navigate } = props.navigation
  const { feed } = mockData.FEED_DATA
  const [showCommentKeyboard, setShowCommentKeyboard] = React.useState(false)
  const scrollRef = React.useRef<ScrollView>()

  React.useEffect(() => {
    const { action, commentId } = props.navigation.state.params
    if (action === "add" && !commentId) {
      scrollRef.current.scrollToEnd({ animated: false })
      setShowCommentKeyboard(true)
    }
  }, [props.navigation.state.params.action])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView ref={scrollRef} style={styles.View}>
        <Comments value={feed[0].comments} navigate={navigate} routes={influencerFeedRoutes} />
      </ScrollView>
      <CommentKeyboard
        onClose={() => setShowCommentKeyboard(false)}
        visible={showCommentKeyboard}
        accomodateTabNavigation={true}
      />
    </SafeAreaView>
  )
}
ExploreFeedCommentsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: () => (
      <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />
    ),
    headerTitle: () => <HeaderTitle title="Comments" />,
  }
}
