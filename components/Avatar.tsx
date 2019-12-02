import React from "react"
import { Image, TouchableOpacity, View } from "react-native"
import { Colors, ImageUris, styles, Units } from "constants"

interface AvatarProps {
  size?: "xs" | "sm" | "md" | "lg"
  source?: string
  onPress?: () => void
}

export const Avatar = ({ size, source = ImageUris.placeholder, onPress }: AvatarProps) => {
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
      margin = (Units.avatarXS - Units.minTouchArea) / 2
      break
    case "sm":
      avatarStyle = styles.AvatarSM
      margin = (Units.avatarSM - Units.minTouchArea) / 2
      break
    case "md":
      avatarStyle = styles.AvatarMD
      margin = (Units.avatarMD - Units.minTouchArea) / 2
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
          style={{
            minHeight: Units.minTouchArea,
            minWidth: Units.minTouchArea,
            marginLeft: margin,
            marginRight: margin,
            marginTop: margin,
            marginBottom: margin,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Image source={{ uri: source }} style={[avatarStyle, { flex: 0, alignSelf: "auto" }]} />
        </TouchableOpacity>
      ) : (
        <View
          style={{
            minHeight: Units.minTouchArea,
            minWidth: Units.minTouchArea,
            marginLeft: margin,
            marginRight: margin,
            marginTop: margin,
            marginBottom: margin,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Image source={{ uri: source }} style={[avatarStyle, { flex: 0, alignSelf: "auto" }]} />
        </View>
      )}
    </>
  )
}
