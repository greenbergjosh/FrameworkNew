import { StyleSheet } from "react-native"
import { Colors, Units } from "./unit.constants"

const mixins = StyleSheet.create({
  avatar: {
    borderColor: Colors.medgrey,
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

  ThumbnailSM: {
    width: Units.thumbnailSM,
    height: Units.thumbnailSM,
    borderColor: Colors.medgrey,
    borderWidth: 1,
  },
})

export default ImageStyles