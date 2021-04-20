import { Input } from "antd"
import { get, set } from "lodash/fp"
import React from "react"
import { bulkTextInputManageForm } from "./bulk-text-input-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { Codec, getCodec, separator } from "./codec"
import { Undraggable } from "components/DragAndDrop/Undraggable"
import { ComponentDefinitionNamedProps, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes"

export interface BulkTextInputInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "bulk-text-input"
  defaultValue: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  valueKey: string
  autosize?: boolean
  minRows?: number
  maxRows?: number
  itemSeparator: separator
  newlinePlaceholder: string
  commaPlaceholder: string
}

interface BulkTextInputInterfaceComponentState {}

function getAutosize(
  minRows: number | undefined,
  maxRows: number | undefined,
  autosize: boolean | undefined
): true | { minRows: number | undefined; maxRows: number | undefined } | undefined {
  const minMaxRows = minRows || maxRows ? { minRows, maxRows } : undefined
  return typeof autosize !== "undefined" && autosize ? true : minMaxRows
}

function getValue(valueKey: string, userInterfaceData: UserInterfaceProps["data"], defaultValue: string, codec: Codec) {
  const rawValue = get(valueKey, userInterfaceData)
  const value = codec.join(rawValue)
  return typeof value !== "undefined" ? value : defaultValue
}

export class BulkTextInputInterfaceComponent extends BaseInterfaceComponent<BulkTextInputInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Form",
      name: "bulk-text-input",
      title: "Bulk Text Input",
      icon: "copy",
      formControl: true,
      componentDefinition: {
        component: "bulk-text-input",
        label: "Bulk Text Input",
      },
    }
  }

  static manageForm = bulkTextInputManageForm

  constructor(props: BulkTextInputInterfaceComponentProps) {
    super(props)
  }

  handleChange = ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { onChangeData, userInterfaceData, valueKey, itemSeparator } = this.props
    const codec: Codec = getCodec(itemSeparator)
    const arrayValue = codec.split(value)
    onChangeData && onChangeData(set(valueKey, arrayValue, userInterfaceData))
  }

  render(): JSX.Element {
    const {
      defaultValue,
      userInterfaceData,
      valueKey,
      autosize,
      minRows,
      maxRows,
      itemSeparator,
      newlinePlaceholder,
      commaPlaceholder,
    } = this.props
    const codec: Codec = getCodec(itemSeparator)
    const value = getValue(valueKey, userInterfaceData, defaultValue, codec)
    const autosizeValue = getAutosize(minRows, maxRows, autosize)
    const placeholder = itemSeparator === separator.comma ? commaPlaceholder : newlinePlaceholder
    return (
      <Undraggable>
        <Input.TextArea onChange={this.handleChange} value={value} autoSize={autosizeValue} placeholder={placeholder} />
      </Undraggable>
    )
  }
}
