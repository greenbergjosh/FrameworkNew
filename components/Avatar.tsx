import React from "react"
import { Image, TouchableOpacity } from "react-native"
import { Colors, ImageUris, styles } from "constants"

interface AvatarProps {
  size?: "sm" | "md" | "lg"
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
  if (size === "sm") {
    avatarStyle = styles.AvatarSM
    margin = -6
  } else if (size === "lg") {
    avatarStyle = styles.AvatarLG
  } else {
    avatarStyle = styles.AvatarMD
    margin = -6
  }

  return (
    <TouchableOpacity
      onPress={onPress && onPress}
      disabled={!onPress}
      style={{
        minHeight: 40,
        minWidth: 40,
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
  )
}
