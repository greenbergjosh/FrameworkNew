import React from "react"
import { FlatList, Text, View } from "react-native"
import { Colors, FontWeights, styles, Units } from "constants"
import { Flex } from "@ant-design/react-native"
import Avatar from "components/Avatar"
import { SMALL } from "components/Markup"
import { CommentsType, CommentType } from "data/api/feed.services"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { Empty } from "components/Empty"
import TouchText from "components/TouchText"
import TouchIcon from "components/TouchIcon"

/************************************
 * Private components and functions
 */

interface CommentProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  comment: CommentType
  size?: "xs" | "sm"
}

function Comment({ comment, size = "sm", navigate, routes }: CommentProps) {
  const { user, message, comments } = comment

  return (
    <>
      <Flex direction="row" align="start" justify="start">
        {/* AVATAR LEFT COLUMN ***********************/}
        <Flex direction="column" align="start" style={{ marginRight: 10 }}>
          <Avatar
            source={user.avatarUri}
            size={size}
            onPress={() => navigate(routes.Feed, { userId: "abc-123" })}
          />
        </Flex>

        {/* COMMENT INFO CENTER COLUMN ***********************/}
        <Flex.Item>
          <Flex direction="row" align="start" wrap="wrap">
            <TouchText
              labelStyle={{ color: Colors.bodyTextEmphasis, fontWeight: FontWeights.bold }}
              onPress={() => navigate(routes.Feed, { userId: "abc-123" })}>
              {`${user.handle}  `}
            </TouchText>
            <Text style={{ color: Colors.bodyTextEmphasis }}>{message}</Text>
          </Flex>
          <Flex style={{ marginTop: Units.padding / 2 }}>
            <SMALL style={{ marginRight: Units.padding }}>3w</SMALL>
            <TouchText
              style={{ marginRight: Units.padding }}
              labelStyle={{
                fontWeight: FontWeights.bold,
                fontSize: styles.SmallCopy.fontSize,
                lineHeight: styles.SmallCopy.lineHeight,
              }}
              onPress={() => alert("View likes feature to come!")}>
              2 Likes
            </TouchText>
            <TouchText
              labelStyle={{
                fontWeight: FontWeights.bold,
                fontSize: styles.SmallCopy.fontSize,
                lineHeight: styles.SmallCopy.lineHeight,
              }}
              onPress={() => alert("Reply feature to come!")}>
              Reply
            </TouchText>
          </Flex>
        </Flex.Item>

        {/* LIKE RIGHT COLUMN ***********************/}
        <Flex direction="column" align="start" style={{ paddingTop: 5 }}>
          <TouchIcon
            toggledNames={{ on: "heart", off: "hearto" }}
            size="xxs"
            onPress={() => alert("Like comment\nFeature to come!")}
            active={comment.liked}
          />
        </Flex>
      </Flex>

      {/* CHILD COMMENTS ***********************/}
      {comment.comments.length > 0 ? (
        <FlatList
          data={comments}
          style={{
            marginLeft: Units.margin,
            paddingLeft: Units.padding,
            paddingTop: Units.margin,
            borderLeftWidth: 1,
            borderColor: Colors.border,
          }}
          ItemSeparatorComponent={() => <View style={{ height: Units.margin }} />}
          keyExtractor={(comment) => comment.id}
          renderItem={({ item }) => (
            <Comment key={item.id} comment={item} size="xs" navigate={navigate} routes={routes} />
          )}
        />
      ) : null}
    </>
  )
}

/************************************
 * Public component
 */

export interface CommentsProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  value: CommentsType
}

/**
 * CommentThread component
 * @public
 */
export const Comments = React.memo(({ navigate, routes, value }: CommentsProps) => {
  const handleUserPress = (userId) => navigate(routes.Feed, { userId })
  const { likes, comments, lastActivity } = value

  return (
    <FlatList
      data={comments}
      keyExtractor={(comment) => comment.id}
      renderItem={({ item }) => <Comment comment={item} navigate={navigate} routes={routes} />}
      ItemSeparatorComponent={() => <View style={{ height: Units.margin * 1.5 }} />}
      ListEmptyComponent={<Empty message="No comments found" style={{ padding: Units.margin }} />}
    />
  )
})
