import { Empty } from "antd"
import React from "react"
import { emptyManageForm } from "./empty-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes"

export interface EmptyInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "empty"
  customImage?: string
  message: string
  image: "default" | "compact"
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
}

export class EmptyInterfaceComponent extends BaseInterfaceComponent<EmptyInterfaceComponentProps> {
  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Form",
      name: "empty",
      title: "Empty",
      icon: "file-unknown",
      componentDefinition: {
        component: "empty",
        label: "Empty",
      },
    }
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
