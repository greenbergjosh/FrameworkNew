import { Form } from "antd"
import React from "react"
import { RenderInterfaceComponent } from "../RenderInterfaceComponent"
import {
  ComponentDefinition,
  BaseInterfaceComponent,
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
      componentDefinition={componentDefinition}
      data={previewData}
      index={0}
      mode={"display"}
      onChangeData={setPreviewData}
      path={"PREVIEW"}
    />
  )

  return layoutDefinition.formControl ? <Form>{renderedComponent}</Form> : renderedComponent
}
