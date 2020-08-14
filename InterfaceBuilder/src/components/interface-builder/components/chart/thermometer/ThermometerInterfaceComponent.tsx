import React from "react"
import { thermometerManageForm } from "./thermometer-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { get } from "lodash/fp"
import getThermometer from "./components"
import { ThermometerInterfaceComponentProps, ThermometerInterfaceComponentState } from "./types"
import { ThermometerIcon } from "./components/ThermometerIcon"
import getColor from "../../_shared/colors"
import { Spin, Tooltip } from "antd"
import { formatNumber } from "components/interface-builder/util/utils"

export class ThermometerInterfaceComponent extends BaseInterfaceComponent<
  ThermometerInterfaceComponentProps,
  ThermometerInterfaceComponentState
> {
  static getLayoutDefinition() {
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

  componentDidUpdate(prevProps: Readonly<ThermometerInterfaceComponentProps>, prevState: Readonly<{}>): void {
    type Value = number | undefined
    const prevValue: Value = get(prevProps.valueKey, prevProps.userInterfaceData)
    const nextValue: Value = get(this.props.valueKey, this.props.userInterfaceData)

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
    const value: number = get(valueKey, userInterfaceData)
    const actualValue: number = absoluteValueKey ? get(absoluteValueKey, userInterfaceData) : null
    const formattedActualValue = formatNumber(actualValue)
    const Thermometer = getThermometer(iconType)
    const coloquialValue = Math.floor(value * 100)
    const displayValue = isNaN(coloquialValue) ? null : `${coloquialValue}%`
    const title = thermometerLabel && displayValue && `${thermometerLabel}: ${formattedActualValue} (${displayValue})`

    return (
      <Spin spinning={this.state.loading && this.props.mode === "display"} size="small">
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
