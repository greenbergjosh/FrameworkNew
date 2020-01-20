import React from "react"
import { Text, View } from "react-native"
import { Colors, routes, styles, Units } from "constants"
import { Flex, WhiteSpace } from "@ant-design/react-native"
import Avatar from "components/Avatar"
import TouchIcon from "components/TouchIcon"
import { A, SMALL, STRONG } from "components/Markup"
import { CommentsType, CommentType, LikesType } from "data/api/feed.services"
import moment from "moment"
import ReadMore from "react-native-read-more-text"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import TouchText from "../TouchText"

/************************************
 * Private components and functions
 */

interface LikesProps {
  value: LikesType
  onPress: (userId: GUID) => void
}

function Likes({ value, onPress }: LikesProps) {
  return (
    <>
      <Flex>
        <Avatar source={value.firstUser.avatarUri} size="xs" />
        <Text style={{ marginLeft: Units.padding / 2 }}>
          Liked by{" "}
          <STRONG
            onPress={() => onPress(value.firstUser.userId)}
            style={{ color: Colors.bodyTextEmphasis }}>
            {value.firstUser.handle}
          </STRONG>{" "}
          and <STRONG>{value.count - 1} others</STRONG>
        </Text>
      </Flex>
      <WhiteSpace size="md" />
    </>
  )
}

function getExpandCommentsPhrase(count) {
  if (count === 1) {
    return "View 1 comment"
  }
  return `View all ${count} comments`
}

interface CommentRowProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  comment: CommentType
  onPress: (userId: GUID) => void
}

function Comment({ comment, onPress, navigate }: CommentRowProps) {
  const { user, message, comments } = comment
  const [collapsed, setCollapsed] = React.useState(true)
  return (
    <View
      style={{
        borderLeftWidth: 1,
        borderColor: Colors.border,
        paddingLeft: Units.padding,
        marginLeft: Units.padding / 2,
      }}>
      <Flex
        direction="row"
        justify="between"
        style={{ alignContent: "stretch", alignItems: "flex-start" }}>
        <Flex
          align="start"
          style={{
            flexGrow: 0,
            flexShrink: 1,
            marginRight: Units.margin,
          }}>
          <STRONG
            onPress={() => onPress(user.userId)}
            style={{ color: Colors.bodyTextEmphasis, marginRight: Units.padding / 2 }}>
            {user.handle}
          </STRONG>
          <Flex.Item>
            {/* EXPAND COMMENTS */}
            <ReadMore
              numberOfLines={1}
              renderTruncatedFooter={(pressHandler) => <A onPress={pressHandler}>more</A>}
              renderRevealedFooter={(pressHandler) => <A onPress={pressHandler}>less</A>}>
              <Text style={styles.Body} numberOfLines={1} ellipsizeMode="tail" selectable={true}>
                {message}
              </Text>
            </ReadMore>
          </Flex.Item>
        </Flex>
        <Flex style={{ flexGrow: 0, flexShrink: 1 }}>
          <TouchIcon
            toggledNames={{ on: "heart", off: "hearto" }}
            size="xs"
            onPress={() => alert("Like comment\nFeature to come!")}
            active={comment.liked}
          />
        </Flex>
      </Flex>

      {/* VIEW MORE COMMENTS LINK */}
      {comments.length > 0 ? (
        <Flex style={{ paddingTop: Units.padding / 2 }}>
          <TouchText
            onPress={() =>
              navigate(routes.Explore.FeedComments, { action: "view", commentId: comment.id })
            }>
            {getExpandCommentsPhrase(comments.length)}
          </TouchText>
        </Flex>
      ) : null}
      <WhiteSpace size="md" />
    </View>
  )
}

/************************************
 * Public component
 */

export interface CommentSummaryProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  value: CommentsType
}

/**
 * Comments component
 * @public
 */
export const CommentSummary = React.memo(({ navigate, routes, value }: CommentSummaryProps) => {
  const handleUserPress = (userId) => navigate(routes.Feed, { userId })
  const { likes, comments, lastActivity } = value

  return (
    <View style={{ marginLeft: Units.margin, marginRight: Units.margin }}>
      <Likes value={likes} onPress={handleUserPress} />
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} onPress={handleUserPress} navigate={navigate} />
      ))}
      <SMALL>
        {moment
          .utc(lastActivity)
          .fromNow(true)
          .toUpperCase()}{" "}
        AGO
      </SMALL>
      <WhiteSpace size="md" />
    </View>
  )
})
