import { Form } from "antd"
import React from "react"
import { RenderInterfaceComponent } from "../RenderInterfaceComponent"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  LayoutDefinition,
} from "../components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

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
