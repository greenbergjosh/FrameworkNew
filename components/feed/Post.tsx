import React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { SocialButtons } from "./SocialButtons"
import { Comments } from "./Comments"
import { WhiteSpace } from "@ant-design/react-native"
import { CampaignRouteParams } from "constants/routeParam.interfaces"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import TouchImage from "../TouchImage"

interface PostProps {
  image: ImageType
  campaignRouteParams: CampaignRouteParams
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  liked?: boolean
  isCurrentUser?: boolean
  style?: StyleProp<ViewStyle>
}

export function Post({
  image,
  campaignRouteParams,
  navigate,
  routes,
  liked,
  isCurrentUser = false,
  style,
}: PostProps) {
  return (
    <View style={style}>
      <TouchImage
        key={image.id}
        size={image.dimensions}
        uri={image.source.uri}
        onPress={() => navigate(routes.Campaign, campaignRouteParams)}
        style={{ flex: 1, height: image.dimensions.height }}
      />
      {isCurrentUser ? <WhiteSpace size="lg" /> : <SocialButtons liked={liked} />}
      <Comments navigate={navigate} routes={routes} />
    </View>
  )
}
