import React from "react"
import { set } from "lodash/fp"
import { Icon, Radio } from "antd"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { MODES, SelectableChildProps, SelectableProps } from "../_shared/selectable/types"
import { Selectable } from "../_shared/selectable/Selectable"
import { radioManageForm } from "./radio-manage-form"
import { IRadioProps, RadioProps } from "./types"
import { Undraggable } from "components/DragAndDrop/Undraggable"
import { RadioChangeEvent } from "antd/lib/radio"
import { LayoutDefinition } from "../../../globalTypes"

export class RadioInterfaceComponent extends BaseInterfaceComponent<RadioProps> {
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
    return {
      category: "Form",
      name: "radio",
      title: "Radio",
      icon: "check-circle",
      formControl: true,
      componentDefinition: {
        component: "radio",
        label: "Radio",
      },
    }
  }

  protected get mode() {
    return this.props.multiple ? MODES.multiple : MODES.default
  }

  handleChange = (e: RadioChangeEvent) => {
    const { onChangeData, userInterfaceData, valueKey, valuePrefix, valueSuffix } = this.props
    const { value } = e.target

    const newValue =
      valuePrefix || valueSuffix
        ? Array.isArray(value)
          ? value.map((v) => `${valuePrefix}${v}${valueSuffix}`)
          : `${valuePrefix}${value}${valueSuffix}`
        : value

    onChangeData && onChangeData(set(valueKey, newValue, userInterfaceData))

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
