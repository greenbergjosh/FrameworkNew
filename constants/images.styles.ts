import { StyleSheet } from "react-native"
import { Colors, Units } from "./unit.constants"

const mixins = StyleSheet.create({
  avatar: {
    borderColor: Colors.grey,
    borderWidth: 1,
  },
})

const ImageStyles = StyleSheet.create({
  AvatarLG: {
    ...mixins.avatar,
    width: Units.avatarLG,
    height: Units.avatarLG,
    borderRadius: Units.avatarLG / 2,
  },

  AvatarMD: {
    ...mixins.avatar,
    width: Units.avatarMD,
    height: Units.avatarMD,
    borderRadius: Units.avatarMD / 2,
  },

  AvatarSM: {
    ...mixins.avatar,
    width: Units.avatarSM,
    height: Units.avatarSM,
    borderRadius: Units.avatarSM / 2,
  },

  AvatarXS: {
    ...mixins.avatar,
    width: Units.avatarXS,
    height: Units.avatarXS,
    borderRadius: Units.avatarXS / 2,
  },

  ThumbnailSM: {
    width: Units.thumbnailSmall,
    height: Units.thumbnailSmall,
    borderColor: Colors.grey,
    borderWidth: 1,
  },
})

export default ImageStyles