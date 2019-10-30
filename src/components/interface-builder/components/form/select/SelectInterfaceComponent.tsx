import React from "react"
import { set } from "lodash/fp"
import { Icon, Select } from "antd"
import { SelectProps as AntdSelectProps } from "antd/lib/select"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { TSEnum } from "../../../@types/ts-enum"
import { Selectable, SelectableChildProps, SelectableProps } from "../../_shared/selectable"
import { selectManageForm } from "./select-manage-form"

/******************************
 * Interfaces, Types, Enums
 */

export interface SelectState {}
export interface ISelectProps {
  allowClear: boolean
  placeholder: string
  multiple?: boolean
}
export type SelectProps = SelectableProps & ISelectProps
export const MODES: TSEnum<AntdSelectProps["mode"]> = {
  default: "default",
  multiple: "multiple",
  tags: "tags",
}

/******************************
 * Component
 */

export class SelectInterfaceComponent extends BaseInterfaceComponent<SelectProps, SelectState> {
  constructor(props: SelectProps) {
    super(props)
  }

  static defaultProps = {
    allowClear: true,
    createNewLabel: "Create New...",
    defaultValue: undefined,
    multiple: false,
    placeholder: "Choose one",
    valueKey: "value",
    valuePrefix: "",
    valueSuffix: "",
  }

  static manageForm = selectManageForm

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "select",
      title: "Select",
      icon: "bars",
      formControl: true,
      componentDefinition: {
        component: "select",
        label: "Select",
      },
    }
  }

  protected get mode() {
    return this.props.multiple ? MODES.multiple : MODES.default
  }

  handleChange = (value: string | string[]) => {
    const { onChangeData, userInterfaceData, valueKey, valuePrefix, valueSuffix } = this.props

    const newValue =
      valuePrefix || valueSuffix
        ? Array.isArray(value)
          ? value.map((v) => `${valuePrefix}${v}${valueSuffix}`)
          : `${valuePrefix}${value}${valueSuffix}`
        : value

    onChangeData && onChangeData(set(valueKey, newValue, userInterfaceData))
  }

  private filterOption = (input: any, option: any) => {
    // When switching about the internals of component during configuration time, the type of children can change
    if (
      typeof option.props.children.toLowerCase === "function" &&
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    ) {
      return true
    } else if (Array.isArray(option.props.children)) {
      return !!option.props.children.find((item: any) => {
        if (
          item &&
          typeof item.toLowerCase === "function" &&
          item.toLowerCase().indexOf(input.toLowerCase()) >= 0
        ) {
          return true
        }
      })
    }
    return false
  }

  /****************************************************************
   * Define this component's render for Selectable to call
   * so Selectable can pass in Selectable state and props.
   * Props must implement SelectableChildProps interface.
   */
  private renderSelect = ({
    allowCreateNew,
    createNewLabel,
    disabled,
    getCleanValue,
    loadError,
    loadStatus,
    options,
  }: SelectableChildProps) => {
    const { placeholder, allowClear, multiple } = this.props as ISelectProps

    const getKeyFromValue = () => {
      const value = getCleanValue()
      return value && value.toString()
    }

    return (
      <Select
        allowClear={allowClear}
        defaultValue={getCleanValue()}
        disabled={disabled}
        filterOption={this.filterOption}
        key={getKeyFromValue()}
        loading={loadStatus === "loading"}
        mode={this.mode}
        onChange={this.handleChange}
        optionFilterProp="label"
        placeholder={placeholder}
        showSearch>
        {options.map((option) => (
          <Select.Option key={`${option.value}`} value={option.value}>
            {typeof option.icon !== "undefined" ? (
              <Icon type={option.icon} style={{ marginRight: "8px" }} />
            ) : null}
            {option.label}
          </Select.Option>
        ))}
        {allowCreateNew && (
          <Select.Option key="create_new_entry" value="create_new">
            {createNewLabel}
          </Select.Option>
        )}
      </Select>
    )
  }

  render(): JSX.Element {
    return (
      // Since props is a union of ISelectProps and SelectableProps, we cast as SelectableProps
      <Selectable {...this.props as SelectableProps}>{this.renderSelect}</Selectable>
    )
  }
}
