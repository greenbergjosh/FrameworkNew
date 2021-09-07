import { Input } from "antd"
import React from "react"
import { bulkTextInputManageForm } from "./bulk-text-input-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  Undraggable,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { Codec, getCodec, separator } from "./codec"
import layoutDefinition from "./layoutDefinition"

export interface BulkTextInputInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "bulk-text-input"
  defaultValue: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  autosize?: boolean
  minRows?: number
  maxRows?: number
  itemSeparator: separator
  newlinePlaceholder: string
  commaPlaceholder: string
}

function getAutosize(
  minRows: number | undefined,
  maxRows: number | undefined,
  autosize: boolean | undefined
): true | { minRows: number | undefined; maxRows: number | undefined } | undefined {
  const minMaxRows = minRows || maxRows ? { minRows, maxRows } : undefined
  return typeof autosize !== "undefined" && autosize ? true : minMaxRows
}

function formatValue(rawValue: string[], defaultValue: string, codec: Codec) {
  const value = codec.join(rawValue)
  return typeof value !== "undefined" ? value : defaultValue
}

export default class BulkTextInputInterfaceComponent extends BaseInterfaceComponent<BulkTextInputInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = bulkTextInputManageForm

  constructor(props: BulkTextInputInterfaceComponentProps) {
    super(props)
  }

  handleChange = ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const codec: Codec = getCodec(this.props.itemSeparator)
    const arrayValue = codec.split(value)
    this.setValue([this.props.valueKey, arrayValue])
  }

  render(): JSX.Element {
    const { defaultValue, valueKey, autosize, minRows, maxRows, itemSeparator, newlinePlaceholder, commaPlaceholder } =
      this.props
    const codec: Codec = getCodec(itemSeparator)
    const value = formatValue(this.getValue(valueKey), defaultValue, codec)
    const autosizeValue = getAutosize(minRows, maxRows, autosize)
    const placeholder = itemSeparator === separator.comma ? commaPlaceholder : newlinePlaceholder
    return (
      <Undraggable>
        <Input.TextArea onChange={this.handleChange} value={value} autoSize={autosizeValue} placeholder={placeholder} />
      </Undraggable>
    )
  }
}
