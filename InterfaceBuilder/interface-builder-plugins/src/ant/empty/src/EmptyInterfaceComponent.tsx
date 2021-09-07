import React from "react"
import { BaseInterfaceComponent, ComponentDefinitionNamedProps, LayoutDefinition } from "@opg/interface-builder"
import { Empty } from "antd"
import { emptyManageForm } from "./empty-manage-form"
import layoutDefinition from "./layoutDefinition"

export interface EmptyInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "empty"
  customImage?: string
  message: string
  image: "default" | "compact"
}

export default class EmptyInterfaceComponent extends BaseInterfaceComponent<EmptyInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = emptyManageForm

  constructor(props: EmptyInterfaceComponentProps) {
    super(props)
  }

  render(): JSX.Element {
    const { customImage, image, message } = this.props
    //
    return (
      <Empty
        description={message}
        image={
          image === "default"
            ? Empty.PRESENTED_IMAGE_DEFAULT
            : image === "compact"
            ? Empty.PRESENTED_IMAGE_SIMPLE
            : image === "custom"
            ? customImage
            : image
        }
      />
    )
  }
}
