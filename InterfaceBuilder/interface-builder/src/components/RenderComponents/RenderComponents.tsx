import React from "react"
import { ComponentRendererProps } from "./types"
import { ComponentRendererModeContext } from "../../contexts/ComponentRendererModeContext"
import { RenderDisplayMode } from "components/RenderComponents/RenderDisplayMode"
import { RenderEditMode } from "components/RenderComponents/RenderEditMode"

export const RenderComponents = (props: ComponentRendererProps): JSX.Element => {
  const contextMode = React.useContext(ComponentRendererModeContext)
  const mode = props.mode || contextMode

  if (mode === "edit" && !props.dragDropDisabled) {
    return <RenderEditMode {...props} />
  }
  return <RenderDisplayMode {...props} />
}
