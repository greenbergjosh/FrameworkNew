import { Input } from "antd"
import React from "react"
import { textAreaManageForm } from "./text-area-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import CharCounter from "../_shared/CharCounter"
import { Undraggable } from "../../../components/DragAndDrop/Undraggable"
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes"

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
  maxLength?: number
}

function getAutosize(
  minRows: number | undefined,
  maxRows: number | undefined,
  autosize: boolean | undefined
): true | { minRows: number | undefined; maxRows: number | undefined } | undefined {
  const minMaxRows = minRows || maxRows ? { minRows, maxRows } : undefined
  return typeof autosize !== "undefined" && autosize ? true : minMaxRows
}

export class TextAreaInterfaceComponent extends BaseInterfaceComponent<TextAreaInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text",
  }

  static getLayoutDefinition(): LayoutDefinition {
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

  handleChange = ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>): void => {
    this.setValue([this.props.valueKey, value])
  }

  render(): JSX.Element {
    const { defaultValue, valueKey, autosize, minRows, maxRows, maxLength } = this.props
    const value = this.getValue(valueKey) || defaultValue || ""
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
