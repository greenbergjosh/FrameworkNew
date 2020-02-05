import React from "react"
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  Dimensions,
  Image,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableHighlight,
  View,
  ViewStyle,
} from "react-native"
import { Colors, ImageUris, ImgSizeType, Units } from "constants"

interface TouchImageProps {
  size?: ImgSizeType | { width?: number; height: number }
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
  const [loading, setLoading] = React.useState(true)
  /*
  NOTE: We use a negative margin to compensate for the 40x40px touch area
  when the touch area is larger than the image itself. Otherwise, the image
  will have too much space around it.
   */

  const [widthStyle, heightStyle, margin, activityIndicatorSize] = React.useMemo(() => {
    let widthStyle: ImageStyle["width"] = 0
    let heightStyle: ImageStyle["height"] = 0

    // ActivityIndicator: Small has a height of 20, large has a height of 36
    let activityIndicatorSize: ActivityIndicatorProps["size"] = "small"

    switch (size) {
      case "img16":
        widthStyle = heightStyle = Units.img16
        break
      case "img24":
        widthStyle = heightStyle = Units.img24
        break
      case "img32":
        widthStyle = heightStyle = Units.img32
        break
      case "img40":
        widthStyle = heightStyle = Units.img40
        break
      case "img64":
        widthStyle = heightStyle = Units.img64
        break
      case "img80":
        widthStyle = heightStyle = Units.img80
        break
      default:
        if (typeof size === "number") {
          heightStyle = size
          widthStyle = "100%"
          if (size > 200) {
            activityIndicatorSize = "large"
          }
        }
        if (typeof size === "object") {
          heightStyle = size.height
          if (size.width) {
            const minWidth = Dimensions.get("window").width * 0.8
            const isFullWidthOkay = size.width > minWidth
            widthStyle = isFullWidthOkay ? "100%" : size.width
          } else {
            widthStyle = "100%"
          }
          if (size.height > 200) {
            activityIndicatorSize = "large"
          }
        }
    }
    return [widthStyle, heightStyle, getMargin(heightStyle), activityIndicatorSize]
  }, [size])

  const wrapperStyles: StyleProp<ViewStyle> = {
    minHeight: Units.minTouchArea,
    minWidth: Units.minTouchArea,
    margin,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: Colors.screenBackground,
    position: "relative",
  }

  const defaultImageStyle: StyleProp<ImageStyle> = {
    flex: 0,
    alignSelf: "auto",
    borderColor: Colors.border,
    borderWidth: 1,
    width: widthStyle,
    height: heightStyle,
    // aspectRatio: 1,
    resizeMode: "cover",
  }

  return (
    <>
      {onPress ? (
        <TouchableOpacity onPress={onPress} style={[wrapperStyles, style]} activeOpacity={0.5}>
          <>
            <ActivityIndicator
              animating={loading}
              size={activityIndicatorSize}
              color={Colors.bodyText}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
              }}
            />
            <Image
              source={{ uri: uri || ImageUris.placeholder }}
              style={[defaultImageStyle, imageStyle]}
              onLoad={() => setLoading(false)}
              progressiveRenderingEnabled={true} // Android only
            />
          </>
        </TouchableOpacity>
      ) : (
        <View style={[wrapperStyles, style]}>
          <Image
            source={{ uri: uri || ImageUris.placeholder }}
            style={[defaultImageStyle, imageStyle]}
          />
        </View>
      )}
    </>
  )
}
