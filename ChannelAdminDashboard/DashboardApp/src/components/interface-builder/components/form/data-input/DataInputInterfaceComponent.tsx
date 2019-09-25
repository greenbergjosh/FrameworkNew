import { Form, Input } from "antd"
import { get, set } from "lodash/fp"
import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { dataInputManageForm } from "./data-input-manage-form"
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent"
import CharCounter from "../_shared/CharCounter"
import { Codec, getCodec, separator } from "./codec"

export interface CsvInputInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "data-input"
  defaultValue: string
  onChangeData: UserInterfaceProps["onChangeData"]
  placeholder: string
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  autosize?: boolean
  minRows?: number
  maxRows?: number
  maxLength?: number
  itemSeparator: separator
  newlinePlaceholder: string
  commaPlaceholder: string
}

interface CsvInputInterfaceComponentState {
}

function getAutosize(
  minRows: number | undefined,
  maxRows: number | undefined,
  autosize: boolean | undefined,
): true | { minRows: number | undefined, maxRows: number | undefined } | undefined {
  const minMaxRows = minRows || maxRows ? { minRows, maxRows } : undefined
  return typeof autosize !== "undefined" && autosize ? true : minMaxRows
}

function getValue(valueKey: string, userInterfaceData: UserInterfaceProps["data"], defaultValue: string, codec: Codec) {
  const rawValue = get(valueKey, userInterfaceData)
  const value = codec.join(rawValue)
  return typeof value !== "undefined" ? value : defaultValue
}

export class DataInputInterfaceComponent extends BaseInterfaceComponent<CsvInputInterfaceComponentProps> {
  static defaultProps = {
    valueKey: "value",
    defaultValue: "",
    placeholder: "Enter text",
  }

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "data-input",
      title: "Data Input",
      icon: "import",
      formControl: true,
      componentDefinition: {
        component: "data-input",
        label: "Data Input",
      },
    }
  }

  static manageForm = dataInputManageForm

  constructor(props: CsvInputInterfaceComponentProps) {
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
      maxLength,
      itemSeparator,
      newlinePlaceholder,
      commaPlaceholder
    } = this.props
    const codec: Codec = getCodec(itemSeparator)
    const value = getValue(valueKey, userInterfaceData, defaultValue, codec)
    const autosizeValue = getAutosize(minRows, maxRows, autosize)
    const placeholder = itemSeparator === separator.comma ? commaPlaceholder : newlinePlaceholder
    return (
      <>
        <Input.TextArea
          onChange={this.handleChange}
          value={value}
          autosize={autosizeValue}
          maxLength={maxLength}
          placeholder={placeholder}
        />
        <CharCounter text={value} maxLength={maxLength}/>
      </>
    )
  }
}
