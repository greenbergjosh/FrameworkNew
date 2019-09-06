import { Form, Input } from "antd"
import { get, set, throttle } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { textAreaManageForm } from "./text-area-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface TextAreaInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "textarea"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  autosize?: boolean
  minRows?: number
  maxRows?: number
}

interface TextAreaInterfaceComponentState {}

export class TextAreaInterfaceComponent extends BaseInterfaceComponent<TextAreaInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text"
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "textarea",
      title: "Text Area v2.1",
      icon: "edit",
      formControl: true,
      componentDefinition: {
        component: "textarea",
        label: "Text Area",
      },
    }
  }

  static manageForm = textAreaManageForm

  constructor(props: TextAreaInterfaceComponentProps) {
    super(props)
  }

  handleChange = ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { onChangeData, userInterfaceData, valueKey } = this.props
    onChangeData && onChangeData(set(valueKey, value, userInterfaceData))
  }
  render(): JSX.Element {
    const { defaultValue, userInterfaceData, valueKey, autosize, minRows, maxRows } = this.props
    const rawValue = get(valueKey, userInterfaceData)
    const value = typeof rawValue !== "undefined" ? rawValue : defaultValue
    const minMaxRows = minRows || maxRows ? { minRows, maxRows } : undefined
    const autosizeValue = typeof autosize !== "undefined" && autosize ? autosize : minMaxRows
    return <Input.TextArea onChange={this.handleChange} value={value} autosize={autosizeValue} />
  }
}
