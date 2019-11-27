import React from "react"
import { Image, TouchableOpacity } from "react-native"
import { Colors, ImageUris, styles } from "constants"

interface AvatarProps {
  size?: "sm" | "md" | "lg"
  source?: string
  onPress?: () => void
}

export const Avatar = ({ size, source = ImageUris.placeholder, onPress }: AvatarProps) => {
  let avatarStyle
  if (size === "sm") {
    avatarStyle = styles.AvatarSM
  } else if (size === "lg") {
    avatarStyle = styles.AvatarLG
  } else {
    avatarStyle = styles.AvatarMD
  }

  return (
    <TouchableOpacity
      onPress={onPress && onPress}
      style={{
        minHeight: 40,
        minWidth: 40,
        marginLeft: -6,
        marginRight: -6,
        marginTop: -6,
        marginBottom: -6,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Image source={{ uri: source }} style={[avatarStyle, { flex: 0, alignSelf: "auto" }]} />
    </TouchableOpacity>
  )
}
