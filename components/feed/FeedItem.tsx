import React from "react"
import { Image, TouchableOpacity } from "react-native"
import { SocialButtons } from "./SocialButtons"
import { Comments } from "./Comments"
import { WhiteSpace } from "@ant-design/react-native"

interface FeedItemProps {
  item: ImageType
  navigate
  routes: FeedRoutes
  isCurrentUser?: boolean
}

export function FeedItem({ item, navigate, routes, isCurrentUser = false }: FeedItemProps) {
  return (
    <>
      <TouchableOpacity
        onPress={() =>
          navigate(routes.Campaign, { promotionId: "bcd991fb-916b-4630-878a-3a313b9db177" })
        }>
        <Image
          key={item.id}
          source={{ uri: item.source.uri }}
          style={{ flex: 1, height: item.dimensions.height }}
        />
      </TouchableOpacity>
      {isCurrentUser ? <WhiteSpace size="lg" /> : <SocialButtons />}
      <Comments navigate={navigate} routes={routes} />
    </>
  )
}
