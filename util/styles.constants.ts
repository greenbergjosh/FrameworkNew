import { StyleProp, TextStyle, ViewStyle } from "react-native"

export default {
  H1: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "300",
  } as StyleProp<TextStyle>,
  H2: {
    fontSize: 24,
    lineHeight: 41,
    fontWeight: "300",
  } as StyleProp<TextStyle>,
  H3: {
    fontSize: 17,
    lineHeight: 18,
    fontWeight: "normal",
    color: "#707070",
  } as StyleProp<TextStyle>,
  Link: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "normal",
    color: "#007AFF",
  } as StyleProp<TextStyle>,
  Button: {
    minWidth: 350,
    foo: "bar"
  } as StyleProp<ViewStyle>,
}