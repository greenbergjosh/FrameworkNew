import { StyleSheet } from "react-native"
import { Colors, Units } from "./unit.constants"

const LayoutStyles = StyleSheet.create({
  ViewContainer: {
    margin: Units.margin,
    marginTop: Units.padding * 4,
  },

  View: {
    margin: Units.margin,
  },

  Header: {
    backgroundColor: Colors.navy,
    height: 60,
  }
})

export default LayoutStyles
