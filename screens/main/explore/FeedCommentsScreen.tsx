import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import NavButton from "components/NavButton"
import { Comments } from "components/feed"
import { influencerFeedRoutes, styles } from "constants"
import { SafeAreaView, ScrollView } from "react-native"
import { CommentKeyboard } from "components/feed/CommentKeyboard"
import { useFeedContext } from "data/feed.contextProvider"
import { ActivityIndicator } from "@ant-design/react-native"

export interface FeedCommentsParams {
  postId: GUID
  commentId?: GUID
  action: string
}

export interface FeedCommentsScreenProps extends NavigationTabScreenProps<FeedCommentsParams> {}

export const FeedCommentsScreen = (props: FeedCommentsScreenProps) => {
  const { navigate } = props.navigation
  const { postId, action, commentId } = props.navigation.state.params
  const [showCommentKeyboard, setShowCommentKeyboard] = React.useState(false)
  const scrollRef = React.useRef<ScrollView>()
  const feedContext = useFeedContext()
  const { comments } = feedContext

  /*
   * Manage comment panel above keyboard
   */
  React.useEffect(() => {
    const { action, commentId } = props.navigation.state.params
    if (scrollRef.current && action === "add" && !commentId) {
      scrollRef.current.scrollToEnd({ animated: false })
      setShowCommentKeyboard(true)
    }
  }, [props.navigation.state.params, scrollRef])

  /*
   * Load Comments Data
   */
  React.useMemo(() => {
    if (!feedContext.lastLoadComments && !feedContext.loading.loadComments[JSON.stringify([])]) {
      feedContext.loadComments(postId)
      return <ActivityIndicator animating toast size="large" text="Loading..." />
    }
  }, [])

  if (!feedContext.lastLoadComments) {
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView ref={scrollRef} style={styles.View}>
        <Comments value={comments} navigate={navigate} routes={influencerFeedRoutes} />
      </ScrollView>
      <CommentKeyboard
        onClose={() => setShowCommentKeyboard(false)}
        visible={showCommentKeyboard}
        accomodateTabNavigation={true}
      />
    </SafeAreaView>
  )
}
FeedCommentsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: () => (
      <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />
    ),
    headerTitle: () => <HeaderTitle title="Comments" />,
  }
}
