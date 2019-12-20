import React from "react"
import { Image, TouchableOpacity } from "react-native"
import { SocialButtons } from "./SocialButtons"
import { Comments } from "./Comments"
import { WhiteSpace } from "@ant-design/react-native"
import { CampaignRouteParams } from "constants/routeParam.interfaces"

interface FeedItemProps {
  image: ImageType
  campaignRouteParams: CampaignRouteParams
  navigate
  routes: FeedRoutes
  isCurrentUser?: boolean
}

export function FeedItem({
  image,
  campaignRouteParams,
  navigate,
  routes,
  isCurrentUser = false,
}: FeedItemProps) {
  return (
    <>
      <TouchableOpacity onPress={() => navigate(routes.Campaign, campaignRouteParams)}>
        <Image
          key={image.id}
          source={{ uri: image.source.uri }}
          style={{ flex: 1, height: image.dimensions.height }}
        />
      </TouchableOpacity>
      {isCurrentUser ? <WhiteSpace size="lg" /> : <SocialButtons />}
      <Comments navigate={navigate} routes={routes} />
    </>
  )
}
