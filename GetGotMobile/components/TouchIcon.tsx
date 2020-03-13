import React from "react"
import { StyleProp, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { AntDesign, Ionicons, Entypo } from "@expo/vector-icons"
import { IconProps as AntIconProps } from "@ant-design/react-native/lib/icon"
import { AntIconSizes, Colors, Units } from "styles"
import { ExpoIconType } from "../@types/expo-icon-type"
import AntIconsMap from "@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/AntDesign.json"
import EntypoIconsMap from "@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Entypo.json"

function getMargin(iconSize) {
  return ((Units.minTouchArea - iconSize) / 2) * -1
}

interface IconProps {
  name: ExpoIconType
  size: AntIconProps["size"]
  style: StyleProp<TextStyle>
}

function Icon({ name, size, style }: IconProps) {
  if (AntIconsMap.hasOwnProperty(name)) {
    return <AntDesign name={name} size={size} style={style} />
  }
  if (EntypoIconsMap.hasOwnProperty(name)) {
    return <Entypo name={name} size={size} style={style} />
  }
  return <Ionicons name={name} size={size} style={style} />
}

interface TouchIconProps {
  size?: AntIconProps["size"]
  name?: ExpoIconType
  toggledNames?: { on: ExpoIconType; off: ExpoIconType }
  active?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  iconStyle?: StyleProp<TextStyle>
  reverse?: boolean
  children?: React.ReactElement<any> | React.ReactElement<any>[]
}

/**
 * @param *
 * @param children - Wraps custom components like Image (svg, png, etc) with same margins and touch behavior as standard icons.
 */
export default function TouchIcon({
  size = "md",
  name,
  toggledNames,
  active = false,
  onPress,
  style,
  iconStyle,
  reverse = false,
  children,
}: TouchIconProps) {
  const [icon, setIcon] = React.useState<ExpoIconType>("question")

  React.useMemo(() => {
    if (toggledNames) {
      setIcon(active ? toggledNames.on : toggledNames.off)
    } else if (name) {
      setIcon(name)
    }
  }, [toggledNames, name, active])

  const [sizePx, wrapperStyles] = React.useMemo(() => {
    let margin = 0
    let sizePx = 0

    /*
     * NOTE: We use a negative margin to compensate for the 40x40px touch area
     * when the touch area is larger than the icon itself. Otherwise, the icon
     * will have too much space around it.
     */
    switch (size) {
      case "xxs":
        margin = getMargin(AntIconSizes.xxs)
        sizePx = AntIconSizes.xxs
        break
      case "xs":
        margin = getMargin(AntIconSizes.xs)
        sizePx = AntIconSizes.xs
        break
      case "sm":
        margin = getMargin(AntIconSizes.sm)
        sizePx = AntIconSizes.sm
        break
      case "md":
        margin = getMargin(AntIconSizes.md)
        sizePx = AntIconSizes.md
        break
      case "lg":
        margin = getMargin(AntIconSizes.lg)
        sizePx = AntIconSizes.lg
        break
      default:
        if (typeof size === "number") {
          margin = getMargin(size)
          sizePx = size
        }
    }

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

    return [sizePx, wrapperStyles]
  }, [size])

  const [defaultIconStyle] = React.useMemo(() => {
    const defaultIconStyle: StyleProp<TextStyle> = {
      color: reverse ? Colors.reverse : Colors.bodyText,
      flex: 0,
      alignSelf: "auto",
    }
    return [defaultIconStyle]
  }, [reverse])

  function toggle() {
    if (toggledNames) {
      setIcon(icon === toggledNames.off ? toggledNames.on : toggledNames.off)
    }
  }

  return (
    <>
      {onPress ? (
        <TouchableOpacity
          onPress={() => {
            toggle()
            onPress()
          }}
          style={[wrapperStyles, style]}>
          {children ? (
            children
          ) : (
            <Icon name={icon} size={sizePx} style={[defaultIconStyle, iconStyle]} />
          )}
        </TouchableOpacity>
      ) : (
        <View style={[wrapperStyles, style]}>
          {children ? (
            children
          ) : (
            <Icon name={icon} size={sizePx} style={[defaultIconStyle, iconStyle]} />
          )}
        </View>
      )}
    </>
  )
}
