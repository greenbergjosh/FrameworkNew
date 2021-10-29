import { isEqual } from "lodash/fp"
import React from "react"
import { deepDiff } from "../../lib/deepDiff"
import { ComponentRendererProps } from "./types"
import { ComponentRendererModeContext } from "../../contexts/ComponentRendererModeContext"
import { v4 as uuid } from "uuid"
import { RenderDisplayMode } from "components/RenderComponents/RenderDisplayMode"
import { RenderEditMode } from "components/RenderComponents/RenderEditMode"

export const RenderComponents = (props: ComponentRendererProps): JSX.Element => {
  // const [id, setId] = React.useState(uuid())
  // const [cnt, setCnt] = React.useState(0)
  const contextMode = React.useContext(ComponentRendererModeContext)
  const mode = props.mode || contextMode

  // React.useEffect(() => {
  //   console.log("ComponentRenderer", { components: props.components, id: `${id} v${cnt}` })
  //   setCnt(cnt + 1)
  // }, [props.components])

  if (mode === "edit" && !props.dragDropDisabled) {
    return <RenderEditMode {...props} />
  }
  return <RenderDisplayMode {...props} />
}
