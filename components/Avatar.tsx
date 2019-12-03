import React from "react"
import { Image, StyleProp, TouchableOpacity, View, ViewStyle } from "react-native"
import { ImageUris, styles, Units } from "constants"

interface AvatarProps {
  size?: "xs" | "sm" | "md" | "lg"
  source?: string
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

export default function Avatar({
  size,
  source = ImageUris.placeholder,
  onPress,
  style,
}: AvatarProps) {
  /*
  NOTE: We use a negative margin to compensate for the 40x40px touch area
  when the touch area is larger than the icon itself. Otherwise, the icon
  will have too much space around it.
   */

  let avatarStyle
  let margin = 0
  switch (size) {
    case "xs":
      avatarStyle = styles.AvatarXS
      margin = ((Units.minTouchArea - styles.AvatarXS.height) / 2) * -1
      break
    case "sm":
      avatarStyle = styles.AvatarSM
      margin = ((Units.minTouchArea - styles.AvatarSM.height) / 2) * -1
      break
    case "md":
      avatarStyle = styles.AvatarMD
      break
    case "lg":
      avatarStyle = styles.AvatarLG
      break
  }

  return (
    <>
      {onPress ? (
        <TouchableOpacity
          onPress={onPress && onPress}
          disabled={!onPress}
          style={[
            {
              minHeight: Units.minTouchArea,
              minWidth: Units.minTouchArea,
              marginLeft: margin,
              marginRight: margin,
              marginTop: margin,
              marginBottom: margin,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
            style,
          ]}>
          <Image source={{ uri: source }} style={[avatarStyle, { flex: 0, alignSelf: "auto" }]} />
        </TouchableOpacity>
      ) : (
        <View
          style={[
            {
              minHeight: Units.minTouchArea,
              minWidth: Units.minTouchArea,
              marginLeft: margin,
              marginRight: margin,
              marginTop: margin,
              marginBottom: margin,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
            style,
          ]}>
          <Image source={{ uri: source }} style={[avatarStyle, { flex: 0, alignSelf: "auto" }]} />
        </View>
      )}
    </>
  )
}
