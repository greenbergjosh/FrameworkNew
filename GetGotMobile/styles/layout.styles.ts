import { StyleSheet } from "react-native"
import { Colors, Units } from "./unit.constants"

const mixins = StyleSheet.create({
  // className: {}
})

const LayoutStyles = StyleSheet.create({
  ViewContainer: {
    margin: Units.margin,
    marginTop: Units.padding * 4,
    height: "100%",
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
    paddingBottom: Units.padding,
    textTransform: "uppercase",
  },

  List: {
  },

  ListRow: {
    paddingLeft: Units.margin,
    paddingRight: Units.margin,
    paddingTop: Units.padding / 2,
    paddingBottom: Units.padding / 2,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.reverse,
  },
})

export default LayoutStyles
