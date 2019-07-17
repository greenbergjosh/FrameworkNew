import { Form } from "antd"
import React from "react"
import { DataPathContext } from "../../../DataPathContext"
import { ComponentRenderer } from "../../ComponentRenderer"
import { UserInterfaceProps } from "../../UserInterface"
import { formManageForm } from "./form-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "../base/BaseInterfaceComponent"

const defaultFormLayout = {
  labelCol: {
    sm: { span: 24 },
    md: { span: 7 },
    lg: { span: 5 },
    xl: { span: 4 },
  },
  wrapperCol: {
    sm: { span: 24 },
    md: { span: 17 },
    lg: { span: 19 },
    xl: { span: 20 },
  },
}

export interface FormInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "form"
  components?: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  orientation: "inline" | "horizontal" | "vertical"
  userInterfaceData?: UserInterfaceProps["data"]
}

export class FormInterfaceComponent extends BaseInterfaceComponent<FormInterfaceComponentProps> {
  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "form",
      title: "Form",
      icon: "form",
      componentDefinition: {
        component: "form",
        label: "Form",
        components: [],
      },
    }
  }

  static manageForm = formManageForm

  render() {
    const { components, onChangeData, orientation, userInterfaceData } = this.props
    // console.log("FormInterfaceComponent.render", { userInterfaceData, onChangeData })
    return (
      <Form style={{ padding: "5px" }} layout={orientation} {...defaultFormLayout}>
        <DataPathContext path="components">
          <ComponentRenderer
            components={components || ([] as ComponentDefinition[])}
            data={userInterfaceData}
            onChangeData={onChangeData}
            onChangeSchema={(newSchema) => {
              console.warn(
                "FormInterfaceComponent.render",
                "TODO: Cannot alter schema inside ComponentRenderer in Form",
                { newSchema }
              )
            }}
          />
        </DataPathContext>
      </Form>
    )
  }
}
