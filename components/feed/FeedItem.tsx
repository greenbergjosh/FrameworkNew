import { Image, TouchableOpacity, View } from "react-native"
import React from "react"
import SocialButtons from "./SocialButtons"
import Comments from "./Comments"
import { routes } from "constants"

export default function FeedItem({ item, navigate }) {
  return (
    <>
      <TouchableOpacity onPress={() => navigate(routes.Explore.Campaign)}>
        <Image key={item.id} source={{ uri: item.uri }} style={{ flex: 1, height: item.height }} />
      </TouchableOpacity>
      <SocialButtons />
      <Comments navigate={navigate} />
    </>
  )
}
