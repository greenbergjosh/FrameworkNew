import { Form } from "antd"
import React from "react"
import { DataPathContext } from "../../../DataPathContext"
import { ComponentRenderer } from "../../ComponentRenderer"
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
  data?: unknown
  components?: ComponentDefinition[]
}

export class FormInterfaceComponent extends BaseInterfaceComponent<FormInterfaceComponentProps> {
  static getLayoutDefinition() {
    return {
      name: "form",
      title: "Form",
      icon: "form",
      componentDefinition: {
        component: "form",
        label: "Form",
      },
    }
  }
  render() {
    const { components } = this.props
    return (
      <Form style={{ padding: "15px" }} {...defaultFormLayout}>
        <DataPathContext path="components">
          <ComponentRenderer components={components || ([] as ComponentDefinition[])} />
        </DataPathContext>
      </Form>
    )
  }
}
