import React from "react"
import { thermometerManageForm } from "./thermometer-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import getThermometer from "./components"
import { ThermometerInterfaceComponentProps, ThermometerInterfaceComponentState } from "./types"
import { ThermometerIcon } from "./components/ThermometerIcon"
import getColor from "../_shared/colors"
import { Icon, Spin, Tooltip } from "antd"
import { formatNumber } from "../../../lib/formatNumber"
import { LayoutDefinition } from "../../../globalTypes"

export class ThermometerInterfaceComponent extends BaseInterfaceComponent<
  ThermometerInterfaceComponentProps,
  ThermometerInterfaceComponentState
> {
  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Chart",
      name: "thermometer",
      title: "Thermometer",
      iconComponent: ThermometerIcon,
      componentDefinition: {
        component: "thermometer",
        label: "Thermometer",
      },
    }
  }

  static manageForm = thermometerManageForm

  constructor(props: ThermometerInterfaceComponentProps) {
    super(props)
    this.state = { loading: true }
  }

  componentDidUpdate(prevProps: Readonly<ThermometerInterfaceComponentProps>): void {
    type Value = number | undefined
    const prevValue: Value = this.getValue(
      prevProps.valueKey,
      prevProps.userInterfaceData,
      prevProps.getRootUserInterfaceData
    )
    const nextValue: Value = this.getValue(this.props.valueKey)

    if (prevValue !== nextValue) {
      this.setState({ loading: false })
    }
  }

  render(): JSX.Element {
    const {
      userInterfaceData,
      valueKey,
      strokeColor,
      strokeWidth,
      fillColor,
      iconType,
      height,
      thermometerLabel,
      absoluteValueKey,
    } = this.props
    const value: number = this.getValue(valueKey)
    const actualValue: number = absoluteValueKey ? this.getValue(absoluteValueKey) : null
    const formattedActualValue = formatNumber(actualValue)
    const Thermometer = getThermometer(iconType)
    const coloquialValue = Math.floor(value * 100)
    const displayValue = isNaN(coloquialValue) ? null : `${coloquialValue}%`
    const title = thermometerLabel && displayValue && `${thermometerLabel}: ${formattedActualValue} (${displayValue})`

    return (
      <Spin spinning={this.state.loading && this.props.mode === "display"} indicator={<Icon type="loading" />}>
        <Tooltip title={title}>
          <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "center" }}>
            <div style={{ flex: "0 1 auto", alignSelf: "auto" }}>
              <Thermometer
                value={value}
                height={height}
                strokeColor={getColor(strokeColor)}
                strokeWidth={strokeWidth}
                fillColor={getColor(fillColor)}
              />
            </div>
          </div>
          {title && (
            <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "center" }}>
              <div style={{ flex: "0 1 auto", alignSelf: "auto", textAlign: "center" }}>{title}</div>
            </div>
          )}
        </Tooltip>
      </Spin>
    )
  }
}
