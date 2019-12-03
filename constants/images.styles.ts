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
    width: Units.img80,
    height: Units.img80,
    borderRadius: Units.img80 / 2,
  },

  AvatarMD: {
    ...mixins.avatar,
    width: Units.img64,
    height: Units.img64,
    borderRadius: Units.img64 / 2,
  },

  AvatarSM: {
    ...mixins.avatar,
    width: Units.img32,
    height: Units.img32,
    borderRadius: Units.img32 / 2,
  },

  AvatarXS: {
    ...mixins.avatar,
    width: Units.img20,
    height: Units.img20,
    borderRadius: Units.img20 / 2,
  },

  ThumbnailSM: {
    width: Units.img40,
    height: Units.img40,
    borderColor: Colors.grey,
    borderWidth: 1,
  },
})

export default ImageStyles