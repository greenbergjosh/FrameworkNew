import React from "react"
import { Image, StyleProp, TouchableOpacity, View, ViewStyle } from "react-native"
import { SocialButtons } from "./SocialButtons"
import { Comments } from "./Comments"
import { WhiteSpace } from "@ant-design/react-native"
import { CampaignRouteParams } from "constants/routeParam.interfaces"
import { NavigationTabScreenProps } from "react-navigation-tabs"

interface FeedItemProps {
  image: ImageType
  campaignRouteParams: CampaignRouteParams
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  isCurrentUser?: boolean
  style?: StyleProp<ViewStyle>
}

export function FeedItem({
  image,
  campaignRouteParams,
  navigate,
  routes,
  isCurrentUser = false,
  style,
}: FeedItemProps) {
  return (
    <View style={style}>
      <TouchableOpacity onPress={() => navigate(routes.Campaign, campaignRouteParams)}>
        <Image
          key={image.id}
          source={{ uri: image.source.uri }}
          style={{ flex: 1, height: image.dimensions.height }}
        />
      </TouchableOpacity>
      {isCurrentUser ? <WhiteSpace size="lg" /> : <SocialButtons />}
      <Comments navigate={navigate} routes={routes} />
    </View>
  )
}
