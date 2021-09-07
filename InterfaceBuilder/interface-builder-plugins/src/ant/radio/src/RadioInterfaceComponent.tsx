import React from "react"
import { BaseInterfaceComponent, LayoutDefinition, Undraggable } from "@opg/interface-builder"
import { Icon, Radio } from "antd"
import { IRadioProps, RadioProps } from "./types"
import {
  MODES,
  SelectableChildProps,
  SelectableProps,
} from "@opg/interface-builder-plugins/lib/ant/shared/selectable/types"
import { RadioChangeEvent } from "antd/lib/radio"
import { radioManageForm } from "./radio-manage-form"
import { Selectable } from "@opg/interface-builder-plugins/lib/ant/shared/selectable/Selectable"
import layoutDefinition from "./layoutDefinition"

export default class RadioInterfaceComponent extends BaseInterfaceComponent<RadioProps> {
  constructor(props: RadioProps) {
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

  static manageForm = radioManageForm

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  protected get mode() {
    return this.props.multiple ? MODES.multiple : MODES.default
  }

  handleChange = (e: RadioChangeEvent) => {
    const { valueKey, valuePrefix, valueSuffix } = this.props
    const { value } = e.target

    const newValue =
      valuePrefix || valueSuffix
        ? Array.isArray(value)
          ? value.map((v) => `${valuePrefix}${v}${valueSuffix}`)
          : `${valuePrefix}${value}${valueSuffix}`
        : value

    this.setValue([valueKey, newValue])
    this.raiseEvent("valueChanged", { value: newValue })
  }

  /****************************************************************
   * Define this component's render for Selectable to call
   * so Selectable can pass in Selectable state and props.
   * Props must implement SelectableChildProps interface.
   */
  private renderRadio = ({ disabled, getCleanValue, options }: SelectableChildProps) => {
    const { size } = this.props as IRadioProps

    const getKeyFromValue = () => {
      const value = getCleanValue()
      return value && value.toString()
    }

    return (
      <Undraggable wrap>
        <Radio.Group
          onChange={this.handleChange}
          defaultValue={getCleanValue()}
          disabled={disabled}
          key={getKeyFromValue()}
          buttonStyle={this.props.buttonStyle}
          size={size}>
          {options.map((option) => {
            switch (this.props.buttonType) {
              case "button":
                return (
                  <Radio.Button key={`${option.value}`} value={option.value}>
                    {typeof option.icon !== "undefined" ? (
                      <Icon type={option.icon} style={{ marginRight: "8px" }} />
                    ) : null}
                    {option.label}
                  </Radio.Button>
                )
              default:
                return (
                  <Radio key={`${option.value}`} value={option.value}>
                    {typeof option.icon !== "undefined" ? (
                      <Icon type={option.icon} style={{ marginRight: "8px" }} />
                    ) : null}
                    {option.label}
                  </Radio>
                )
            }
          })}
        </Radio.Group>
      </Undraggable>
    )
  }

  render(): JSX.Element {
    return (
      // Since props is a union of IRadioProps and SelectableProps, we cast as SelectableProps
      <Selectable {...(this.props as SelectableProps)}>{this.renderRadio}</Selectable>
    )
  }
}
