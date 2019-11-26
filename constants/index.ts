import { StyleSheet } from "react-native"
import ImageStyles from "./images.styles"
import TextStyles from "./text.styles"
import FormStyles from "./form.styles"
import LayoutStyles from "./layout.styles"

export * from "./route.constants"
export * from "./unit.constants"

export const styles = StyleSheet.create({
  ...TextStyles,
  ...FormStyles,
  ...LayoutStyles,
  ...ImageStyles,
})
