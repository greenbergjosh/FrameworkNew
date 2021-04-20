import { Form } from "antd"
import React from "react"
import { RenderInterfaceComponent } from "../ComponentRenderer"
import { BaseInterfaceComponent } from "../BaseInterfaceComponent/BaseInterfaceComponent"
import { ComponentDefinition, LayoutDefinition, UserInterfaceProps } from "../../globalTypes"

export interface ManageComponentPreviewProps {
  Component: typeof BaseInterfaceComponent
  componentDefinition: ComponentDefinition
  layoutDefinition: LayoutDefinition
  userInterfaceData: UserInterfaceProps["data"]
}

export const ManageComponentPreview = ({
  Component,
  componentDefinition,
  layoutDefinition,
  userInterfaceData,
}: ManageComponentPreviewProps) => {
  const [previewData, setPreviewData] = React.useState(userInterfaceData || {})

  const renderedComponent = (
    <RenderInterfaceComponent
      Component={Component}
      componentDefinition={{ ...componentDefinition, preview: true }}
      userInterfaceData={previewData}
      getRootData={() => previewData}
      index={0}
      mode={"preview"}
      onChangeData={setPreviewData}
      path={"PREVIEW"}
    />
  )

  return layoutDefinition.formControl ? <Form>{renderedComponent}</Form> : renderedComponent
}
