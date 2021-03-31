import React from "react"
import { set } from "lodash/fp"
import { Icon, Select } from "antd"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { MODES, SelectableChildProps, SelectableProps } from "../../_shared/selectable/types"
import { Selectable } from "../../_shared/selectable/Selectable"
import { selectManageForm } from "./select-manage-form"
import { ISelectProps, SelectProps, SelectState } from "./types"
import { Undraggable } from "../../_shared/Undraggable"

export class SelectInterfaceComponent extends BaseInterfaceComponent<SelectProps, SelectState> {
  constructor(props: SelectProps) {
    super(props)
  }

  static availableEvents = ["valueChanged"]

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
        if (item && typeof item.toLowerCase === "function" && item.toLowerCase().indexOf(input.toLowerCase()) >= 0) {
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
    const { placeholder, allowClear, multiple, size } = this.props as ISelectProps

    const getKeyFromValue = () => {
      const value = getCleanValue()
      return value && value.toString()
    }

    return (
      <Undraggable wrap>
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
      </Undraggable>
    )
  }

  render(): JSX.Element {
    return (
      // Since props is a union of ISelectProps and SelectableProps, we cast as SelectableProps
      <Selectable {...(this.props as SelectableProps)}>{this.renderSelect}</Selectable>
    )
  }
}
