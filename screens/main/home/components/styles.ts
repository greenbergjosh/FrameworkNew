import { StyleSheet } from "react-native"
import { Colors } from "constants"

export const carouselStyles = StyleSheet.create({
  carouselHorizontal: {
    borderWidth: 1,
    borderColor: Colors.grey,
    padding: 16,
    paddingBottom: 3,
    marginBottom: 32,
    marginRight: "auto",
    marginLeft: "auto",
    width: 235,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
})