import React from "react"
import { set } from "lodash/fp"
import { Icon, Select } from "antd"
import { BaseInterfaceComponent } from "@opg/interface-builder"
import { MODES, SelectableChildProps, SelectableProps } from "../_shared/selectable/types"
import { Selectable } from "../_shared/selectable/Selectable"
import { selectManageForm } from "./select-manage-form"
import { ISelectProps, SelectProps, SelectState } from "./types"

/******************************
 * Component
 */

export class SelectInterfaceComponent extends BaseInterfaceComponent<SelectProps, SelectState> {
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

  static availableEvents = ["valueChanged", "dropdownOpened", "focused"]

  handleChange = (value: string | string[]) => {
    const { onChangeData, userInterfaceData, valueKey, valuePrefix, valueSuffix } = this.props

    const newValue =
      valuePrefix || valueSuffix
        ? Array.isArray(value)
          ? value.map((v) => `${valuePrefix}${v}${valueSuffix}`)
          : `${valuePrefix}${value}${valueSuffix}`
        : value

    onChangeData && onChangeData(set(valueKey, newValue, userInterfaceData))

    this.raiseEvent("valueChanged", { value: newValue })
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
        return item && typeof item.toLowerCase === "function" && item.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
    loadStatus,
    options,
    handleFocus,
  }: SelectableChildProps) => {
    const { placeholder, allowClear, size } = this.props as ISelectProps

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
        onFocus={handleFocus}
        optionFilterProp="label"
        placeholder={placeholder}
        showSearch
        size={size}>
        {options.map((option) => (
          <Select.Option key={`${option.value}`} value={option.value}>
            {typeof option.icon !== "undefined" ? <Icon type={option.icon} style={{ marginRight: "8px" }} /> : null}
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
      <Selectable {...(this.props as SelectableProps)}>{this.renderSelect}</Selectable>
    )
  }
}
