import { StyleSheet } from "react-native"
import { Colors, Units } from "./unit.constants"

const mixins = StyleSheet.create({
  // className: {}
})

const LayoutStyles = StyleSheet.create({
  ViewContainer: {
    margin: Units.margin,
    marginTop: Units.padding * 4,
  },

  View: {
    margin: Units.margin,
  },

  Header: {
    paddingLeft: Units.margin,
    paddingRight: Units.margin,
  },

  HeaderSm: {
    // height: 30,
  },

  SubHeader: {
    backgroundColor: Colors.navBarBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "flex-start",
    alignItems: "center",
    alignContent: "stretch",
    padding: Units.margin,
    paddingBottom: Units.padding
  },
})

export default LayoutStyles
