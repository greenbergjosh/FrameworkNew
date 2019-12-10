import { StyleSheet } from "react-native"
import ImageStyles from "./images.styles"
import TextStyles from "./text.styles"
import FormStyles from "./form.styles"
import LayoutStyles from "./layout.styles"
import * as routeConstants from "./route.constants"
import * as unitConstants from "./unit.constants"
import * as navigationConstants from "./navigation.constants"

export const { FontWeights, ImageUris, Units, Colors, AntIconSizes } = unitConstants
export const { routes } = routeConstants
export const { defaultNavigationOptions } = navigationConstants
export const styles = StyleSheet.create({
  ...TextStyles,
  ...FormStyles,
  ...LayoutStyles,
  ...ImageStyles,
})

export function devBorder(color) {
  return {
    borderWidth: 1,
    borderColor: color,
  }
}