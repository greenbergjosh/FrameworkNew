import { Image, StyleProp, View, ViewStyle } from "react-native"
import React from "react"
import { ImageUris, Units, Colors } from "styles"

interface ImageThumbnailProps {
  image: string | string[]
  size?: "sm" | "md" | "lg"
  styles?: StyleProp<ViewStyle>
}

export function ImageThumbnail({ image, size }: ImageThumbnailProps) {
  function getUri() {
    const uri = Array.isArray(image) ? image[0] : image
    return uri || ImageUris.placeholder
  }

  let iconSize
  let radius
  switch (size) {
    case "sm":
      iconSize = Units.img40
      radius = Units.margin * 0.44
      break
    case "lg":
      iconSize = Units.img128
      radius = Units.margin * 1.42
      break
    default:
      iconSize = Units.thumb90
      radius = Units.margin
  }

  const sizeStyle = {
    width: iconSize,
    height: iconSize,
  }

  return (
    <View
      style={{
        ...sizeStyle,
        borderRadius: radius,
        overflow: "hidden",
        borderColor: Colors.border,
        borderWidth: 1,
      }}>
      <Image style={sizeStyle} source={{ uri: getUri() }} />
    </View>
  )
}