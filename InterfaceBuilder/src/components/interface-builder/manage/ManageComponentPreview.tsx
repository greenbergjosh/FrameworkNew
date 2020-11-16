import { Form } from "antd"
import React from "react"
import { RenderInterfaceComponent } from "../RenderInterfaceComponent"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  LayoutDefinition,
} from "../components/base/BaseInterfaceComponent"

export interface ManageComponentPreviewProps {
  Component: typeof BaseInterfaceComponent
  componentDefinition: ComponentDefinition
  layoutDefinition: LayoutDefinition
}

export const ManageComponentPreview = ({
  Component,
  componentDefinition,
  layoutDefinition,
}: ManageComponentPreviewProps) => {
  const [previewData, setPreviewData] = React.useState({})

  const renderedComponent = (
    <RenderInterfaceComponent
      Component={Component}
      componentDefinition={{ ...componentDefinition, preview: true }}
      data={previewData}
      getRootData={() => previewData}
      index={0}
      mode={"display"}
      onChangeData={setPreviewData}
      path={"PREVIEW"}
    />
  )

  return layoutDefinition.formControl ? <Form>{renderedComponent}</Form> : renderedComponent
}
