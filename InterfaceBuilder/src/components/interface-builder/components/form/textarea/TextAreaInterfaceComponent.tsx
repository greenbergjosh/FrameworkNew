import { Input } from "antd"
import { get, set } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { textAreaManageForm } from "./text-area-manage-form"
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent"
import CharCounter from "../_shared/CharCounter"
import { Undraggable } from "../../_shared/Undraggable"

export interface TextAreaInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "textarea"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  valueKey: string
  autosize?: boolean
  minRows?: number
  maxRows?: number
  maxLength?: number
}

interface TextAreaInterfaceComponentState {}

function getAutosize(
  minRows: number | undefined,
  maxRows: number | undefined,
  autosize: boolean | undefined
): true | { minRows: number | undefined; maxRows: number | undefined } | undefined {
  const minMaxRows = minRows || maxRows ? { minRows, maxRows } : undefined
  return typeof autosize !== "undefined" && autosize ? true : minMaxRows
}

function getValue(valueKey: string, userInterfaceData: UserInterfaceProps["data"], defaultValue: string | undefined) {
  const rawValue = get(valueKey, userInterfaceData)
  return typeof rawValue !== "undefined" ? rawValue : defaultValue
}

export class TextAreaInterfaceComponent extends BaseInterfaceComponent<TextAreaInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "textarea",
      title: "Text Area",
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
    const { defaultValue, userInterfaceData, valueKey, autosize, minRows, maxRows, maxLength } = this.props
    const value = getValue(valueKey, userInterfaceData, defaultValue)
    const autosizeValue = getAutosize(minRows, maxRows, autosize)
    return (
      <>
        <Undraggable>
          <Input.TextArea onChange={this.handleChange} value={value} autoSize={autosizeValue} maxLength={maxLength} />
        </Undraggable>
        <CharCounter text={value} maxLength={maxLength} />
      </>
    )
  }
}
