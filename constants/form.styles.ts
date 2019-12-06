import { StyleSheet } from "react-native"
import { Colors } from "./unit.constants"

const FormStyles = StyleSheet.create({
  LinkButton: {
    borderWidth: 0,
  },

  Button: {
    minWidth: 200,
  },

  BottomButtonBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.greyExtraLight,
  },
})

export default FormStyles
