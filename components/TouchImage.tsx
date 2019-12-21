import React from "react"
import { Image, StyleProp, TouchableOpacity, View, ViewStyle, ImageStyle } from "react-native"
import { Colors, Units, devBorder, ImageUris } from "constants"

interface TouchImageProps {
  size?: "img16" | "img24" | "img32" | "img40" | "img64" | "img80" | number
  uri: string
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
}

function getMargin(iconSize) {
  const iconSmallerThanTouchArea = Units.minTouchArea - iconSize
  if (iconSmallerThanTouchArea < 0) return 0
  else return ((Units.minTouchArea - iconSize) / 2) * -1
}

export default function TouchImage({
  size = "img32",
  uri = ImageUris.placeholder,
  onPress,
  style,
  imageStyle,
}: TouchImageProps) {
  /*
  NOTE: We use a negative margin to compensate for the 40x40px touch area
  when the touch area is larger than the image itself. Otherwise, the image
  will have too much space around it.
   */

  const [imageSize, margin] = React.useMemo(() => {
    let imageSize = 0
    switch (size) {
      case "img16":
        imageSize = Units.img16
        break
      case "img24":
        imageSize = Units.img24
        break
      case "img32":
        imageSize = Units.img32
        break
      case "img40":
        imageSize = Units.img40
        break
      case "img64":
        imageSize = Units.img64
        break
      case "img80":
        imageSize = Units.img80
        break
      default:
        if (typeof size === "number") imageSize = size
    }
    return [imageSize, getMargin(imageSize)]
  }, [size])

  const wrapperStyles: StyleProp<ViewStyle> = {
    minHeight: Units.minTouchArea,
    minWidth: Units.minTouchArea,
    marginLeft: margin,
    marginRight: margin,
    marginTop: margin,
    marginBottom: margin,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }

  const defaultIconStyle: StyleProp<ImageStyle> = {
    flex: 0,
    alignSelf: "auto",
    borderColor: Colors.border,
    borderWidth: 1,
    width: imageSize,
    height: imageSize,
  }

  return (
    <>
      {onPress ? (
        <TouchableOpacity onPress={onPress} style={[wrapperStyles, style]}>
          <Image
            source={{ uri: uri || ImageUris.placeholder }}
            style={[defaultIconStyle, imageStyle]}
          />
        </TouchableOpacity>
      ) : (
        <View style={[wrapperStyles, style]}>
          <Image
            source={{ uri: uri || ImageUris.placeholder }}
            style={[defaultIconStyle, imageStyle]}
          />
        </View>
      )}
    </>
  )
}
