import { StyleProp, TextStyle, ViewStyle } from "react-native"
import { ButtonStyles } from "@ant-design/react-native/es/button/style"

export enum Colors {
  lightgrey = "#F8F8F8",
  grey = "#707070",
  blue = "#007AFF",
}
export enum FontWeights {
  light = "300",
  regular = "normal",
  bold = "600",
}

export const styles = {
  H1: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: FontWeights.light,
  } as StyleProp<TextStyle>,
  H2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: FontWeights.light,
    textAlign: "center",
  } as StyleProp<TextStyle>,
  H3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: FontWeights.regular,
    color: Colors.grey,
  } as StyleProp<TextStyle>,
  Body: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: FontWeights.regular,
    color: Colors.grey,
  } as StyleProp<TextStyle>,
  LinkText: {
    color: Colors.blue,
  } as StyleProp<TextStyle>,
  LinkButton: {
    borderWidth: 0,
  } as StyleProp<ViewStyle>,
  Button: {
    minWidth: 200,
  } as StyleProp<ViewStyle>,
  ViewContainer: {
    margin: 17,
    marginTop: 40,
  } as StyleProp<ViewStyle>,
  View: {
    margin: 17,
  } as StyleProp<ViewStyle>,
  SmallCopy: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: FontWeights.regular,
    color: Colors.grey,
  } as StyleProp<TextStyle>,
  BottomButtonBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.lightgrey,
  } as StyleProp<ViewStyle>,
}

export const combineStyles = (a, b) => ({ ...a, ...b })
