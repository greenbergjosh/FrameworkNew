import { StyleSheet } from "react-native"
import { Colors, FontWeights, Units } from "./unit.constants"


const TextStyles = StyleSheet.create({
  H1: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: FontWeights.light,
  },

  H2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: FontWeights.light,
    textAlign: "center",
  },

  H3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: FontWeights.regular,
    color: Colors.grey,
  },

  Body: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: FontWeights.regular,
    color: Colors.grey,
  },

  LinkText: {
    color: Colors.blue,
  },

  ErrorText: {
    color: "red",
    paddingTop: Units.padding,
    paddingBottom: Units.padding,
  },

  LinkButton: {
    borderWidth: 0,
  },

  Button: {
    minWidth: 200,
  },

  ViewContainer: {
    margin: Units.margin,
    marginTop: Units.padding * 4,
  },

  View: {
    margin: Units.margin,
  },

  SmallCopy: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: FontWeights.regular,
    color: Colors.grey,
  },
})

export default TextStyles