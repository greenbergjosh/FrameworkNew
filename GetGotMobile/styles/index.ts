import { StyleSheet } from "react-native"
import ImageStyles from "./images.styles"
import TextStyles from "./text.styles"
import FormStyles from "./form.styles"
import LayoutStyles from "./layout.styles"
import * as unitConstants from "./unit.constants"
import { ImgSizeType as _ImgSizeType } from "./unit.constants"

export type ImgSizeType = _ImgSizeType
export const { FontWeights, ImageUris, Images, Units, Colors, AntIconSizes } = unitConstants
export const styles = StyleSheet.create({
  ...TextStyles,
  ...FormStyles,
  ...LayoutStyles,
  ...ImageStyles,
})

export function devBorder(color, width = 1) {
  return {
    borderWidth: width,
    borderColor: color,
  }
}
