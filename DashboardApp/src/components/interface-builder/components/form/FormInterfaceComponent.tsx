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
    md: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 24 },
    md: { span: 14 },
  },
}

export interface FormInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "form"
  components?: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
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
    const { components, onChangeData, userInterfaceData } = this.props
    // console.log("FormInterfaceComponent.render", { userInterfaceData, onChangeData })
    return (
      <Form style={{ padding: "5px" }} layout="vertical" {...defaultFormLayout}>
        <DataPathContext path="components">
          <ComponentRenderer
            components={components || ([] as ComponentDefinition[])}
            data={userInterfaceData}
            onChangeData={onChangeData}
          />
        </DataPathContext>
      </Form>
    )
  }
}
