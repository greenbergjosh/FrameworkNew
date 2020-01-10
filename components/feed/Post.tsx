import React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { SocialButtons } from "./SocialButtons"
import { Comments } from "./Comments"
import { WhiteSpace } from "@ant-design/react-native"
import { CampaignRouteParams } from "constants/routeParam.interfaces"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import TouchImage from "../TouchImage"
import { PostType } from "api/feed-services"

interface PostProps {
  value: PostType
  campaignRouteParams: CampaignRouteParams
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  isCurrentUser?: boolean
  style?: StyleProp<ViewStyle>
}

export function Post({
  value,
  campaignRouteParams,
  navigate,
  routes,
  isCurrentUser = false,
  style,
}: PostProps) {
  const { image, comments, liked } = value;

  return (
    <View style={style}>
      <TouchImage
        key={image.id}
        size={image.dimensions}
        uri={image.source.uri}
        onPress={() => navigate(routes.Campaign, campaignRouteParams)}
        style={{ flex: 1, height: image.dimensions.height }}
      />
      {isCurrentUser ? (
        <WhiteSpace size="lg" />
      ) : (
        <SocialButtons liked={liked} commentsEnabled={comments.enabled} />
      )}
      {comments.enabled ? (
        <Comments value={comments} navigate={navigate} routes={routes} />
      ) : null}
    </View>
  )
}
