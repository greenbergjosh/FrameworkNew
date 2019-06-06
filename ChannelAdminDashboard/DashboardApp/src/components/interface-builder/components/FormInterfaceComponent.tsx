import { Form } from "antd"
import React from "react"
import { DataPathContext } from "../../DataPathContext"
import { ComponentRenderer } from "../ComponentRenderer"
import { BaseInterfaceComponent, ComponentDefinition } from "./BaseInterfaceComponent"

export interface FormInterfaceComponentProps extends ComponentDefinition {
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
    }
  }
  render() {
    const { components, mode } = this.props
    return (
      <Form style={{ padding: "15px" }}>
        <DataPathContext path="components">
          <ComponentRenderer components={components || ([] as ComponentDefinition[])} mode={mode} />
        </DataPathContext>
      </Form>
    )
  }
}
