import { Image, View } from "react-native"
import React from "react"
import { ImageUris, Units, Colors } from "constants"

export function PromotionThumb(props: { payload: any }) {
  const { images } = props.payload
  return (
    <View
      style={{
        width: Units.thumb90,
        height: Units.thumb90,
        borderRadius: Units.margin,
        overflow: "hidden",
        borderColor: Colors.greyLight,
        borderWidth: 1,
      }}>
      <Image
        style={{ width: Units.thumb90, height: Units.thumb90 }}
        source={{
          uri: (Array.isArray(images) ? images[0] : images) || ImageUris.placeholder,
        }}
      />
    </View>
  )
}
