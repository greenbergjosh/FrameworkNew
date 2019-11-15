import { StyleProp, TextStyle, ViewStyle } from "react-native"

enum Colors {
  grey = "#707070",
  blue = "#007AFF",
}
enum FontWeight {
  light = "300",
  regular = "normal",
}

export const styles = {
  H1: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: FontWeight.light,
  } as StyleProp<TextStyle>,
  H2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: FontWeight.light,
    textAlign: "center",
  } as StyleProp<TextStyle>,
  H3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: FontWeight.regular,
    color: Colors.grey,
    textAlign: "center",
  } as StyleProp<TextStyle>,
  LinkText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: FontWeight.regular,
    color: Colors.blue,
  } as StyleProp<TextStyle>,
  LinkButton: {
    borderWidth: 0,
  } as StyleProp<ViewStyle>,
  Button: {
    minWidth: 200,
  } as StyleProp<ViewStyle>,
  View: {
    margin: 17,
    marginTop: 40,
  } as StyleProp<ViewStyle>,
  SmallCopy: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: FontWeight.regular,
    color: Colors.grey,
  } as StyleProp<TextStyle>,
  SmallCopyLink: {
    ...this.SmallCopy,
    color: Colors.blue,
  } as StyleProp<TextStyle>,
}

export const combineStyles = (a, b) => ({ ...a, ...b })
