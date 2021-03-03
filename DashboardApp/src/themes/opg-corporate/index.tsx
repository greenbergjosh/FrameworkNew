import React from "react"
import previewImage from "./preview.jpg"
import { ITheme } from "../types"
import { Shell } from "./views/Shell"

const Theme: ITheme = {
  Shell,
}

export default Theme

export function Preview(): JSX.Element {
  return <img alt="OPG Corporate Preview" src={previewImage} width={512} height={384} />
}
