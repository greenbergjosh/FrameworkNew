import { Form, Input } from "antd"
import React from "react"
import { inputManageForm } from "./input-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface InputInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "input"
  defaultValue?: string
  placeholder: string
  valueKey: string
  value: string
}

interface InputInterfaceComponentState {
  value: string
}

export class InputInterfaceComponent extends BaseInterfaceComponent<
  InputInterfaceComponentProps,
  InputInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text",
  }

  static getLayoutDefinition() {
    return {
      name: "input",
      title: "Text Input",
      icon: "edit",
      formControl: true,
      componentDefinition: {
        component: "input",
        label: "Text",
      },
    }
  }

  static manageForm = inputManageForm

  constructor(props: InputInterfaceComponentProps) {
    super(props)
    const { defaultValue, value } = props

    this.state = { value: value || defaultValue || "" }
  }

  handleChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value })
  }

  render(): JSX.Element {
    return <Input onChange={this.handleChange} value={this.state.value} />
    // return (
    //   <Form.Item label={this.props.label}>
    //     <Input />
    //   </Form.Item>
    // )
  }
}
