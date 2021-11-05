import { getColor } from "@opg/interface-builder-plugins/lib/nivo/shared"
import getThermometer from "./components"
import React from "react"
import { BaseInterfaceComponent, formatNumber, LayoutDefinition } from "@opg/interface-builder"
import { Icon, Spin, Tooltip } from "antd"
import { ThermometerInterfaceComponentProps, ThermometerInterfaceComponentState } from "./types"
import { settings } from "./settings"
import layoutDefinition from "./layoutDefinition"

export default class ThermometerInterfaceComponent extends BaseInterfaceComponent<
  ThermometerInterfaceComponentProps,
  ThermometerInterfaceComponentState
> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

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
