import { StyleSheet } from "react-native"
import { Colors } from "constants"
import { Units } from "../../../../constants/unit.constants"

export const carouselStyles = StyleSheet.create({
  carouselHorizontal: {
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Units.margin,
    paddingBottom: 3,
    marginBottom: Units.margin * 2,
    marginRight: "auto",
    marginLeft: "auto",
    width: 212,
    borderTopLeftRadius: Units.padding * 2,
    borderTopRightRadius: Units.padding * 2,
  },
})