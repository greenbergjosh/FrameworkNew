import { StyleSheet } from "react-native"
import { Colors, Units } from "./unit.constants"

const mixins = StyleSheet.create({
  // header: {
  //   color: Colors.white,
  //   backgroundColor: Colors.navy,
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
})

export default LayoutStyles
