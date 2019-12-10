import { StyleSheet } from "react-native"
import { Colors, Units } from "./unit.constants"

const mixins = StyleSheet.create({
  // header: {
  //   color: Colors.reverse,
  //   backgroundColor: Colors.ggNavy,
  //   height: 60,
  // }
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
    // ...mixins.header,
  },

  HeaderLg: {
    // ...mixins.header,
    // height: 60,
  },

  HeaderSm: {
    // ...mixins.header,
    // height: 30,
  },

  ListHeader: {
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
