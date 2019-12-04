import React from "react"
import { Image, TouchableOpacity } from "react-native"
import { SocialButtons } from "./SocialButtons"
import { Comments } from "./Comments"
import { WhiteSpace } from "@ant-design/react-native"

interface FeedItemProps {
  item
  navigate
  routes: FeedRoutes
  isCurrentUser?: boolean
}

export function FeedItem({ item, navigate, routes, isCurrentUser = false }: FeedItemProps) {
  return (
    <>
      <TouchableOpacity onPress={() => navigate(routes.Campaign)}>
        <Image key={item.id} source={{ uri: item.uri }} style={{ flex: 1, height: item.height }} />
      </TouchableOpacity>
      {isCurrentUser ? <WhiteSpace size="lg" /> : <SocialButtons />}
      <Comments navigate={navigate} routes={routes} />
    </>
  )
}
