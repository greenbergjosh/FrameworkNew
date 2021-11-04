import React from "react"
import { Icon, Select } from "antd"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { MODES, ModeType, SelectableChildProps, SelectableProps } from "../_shared/selectable/types"
import { Selectable } from "../_shared/selectable/Selectable"
import { selectManageForm } from "./select-manage-form"
import { SelectProps, SelectState } from "./types"
import { isUndefined, isString } from "lodash/fp"
import { AbstractSelectProps } from "antd/lib/select"
import layoutDefinition from "./layoutDefinition"

export default class SelectInterfaceComponent extends BaseInterfaceComponent<SelectProps, SelectState> {
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

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  protected get mode(): ModeType {
    return this.props.multiple ? MODES.multiple : MODES.default
  }

  static availableEvents = ["valueChanged"]

  handleChange = (value: string | string[]): void => {
    const { valueKey, valuePrefix, valueSuffix } = this.props
    const newValue =
      valuePrefix || valueSuffix
        ? Array.isArray(value)
          ? value.map((v) => `${valuePrefix}${v}${valueSuffix}`)
          : `${valuePrefix}${value}${valueSuffix}`
        : value

    this.setValue([valueKey, newValue])
    this.raiseEvent("valueChanged", { value: newValue })
  }

  private shouldShowLinkIcon(
    valueKey: string,
    dataHandlerType: SelectableProps["dataHandlerType"],
    multiple?: boolean
  ) {
    const hasData = !isUndefined(this.getValue(valueKey))
    const hasRemoteConfig = dataHandlerType === "remote-config"
    const isSingleSelect = multiple !== true
    return hasRemoteConfig && isSingleSelect && hasData
  }

  private filterOption: AbstractSelectProps["filterOption"] = (input, option) => {
    /*
     * When switching the internals of component during configuration time,
     * the type of children can change.
     */
    if (isString(option.props.children) && option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0) {
      return true
    } else if (Array.isArray(option.props.children)) {
      const node = option.props.children.find((item) => {
        return isString(item) && item.toLowerCase().indexOf(input.toLowerCase()) >= 0
      })
      return !isUndefined(node)
    }
    return false
  }

  private handleIconClick = () => {
    const value = this.getValue(this.props.valueKey)
    value && window.open(`${window.location.origin}/app/admin/global-config/${value}`)
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
    const { placeholder, allowClear, size, dataHandlerType, valueKey, multiple } = this.props
    const showLinkIcon = this.shouldShowLinkIcon(valueKey, dataHandlerType, multiple)
    const getKeyFromValue = () => {
      const value = getCleanValue()
      return value && value.toString()
    }

    return (
      <div style={{ display: "grid", gridTemplateColumns: "auto 20px", alignItems: "baseline" }}>
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
        {showLinkIcon && <Icon type="link" style={{ cursor: "pointer" }} onClick={this.handleIconClick} />}
      </div>
    )
  }

  render(): JSX.Element {
    return (
      // Since props is a union of ISelectProps and SelectableProps, we cast as SelectableProps
      <Selectable {...(this.props as SelectableProps)}>{this.renderSelect}</Selectable>
    )
  }
}
