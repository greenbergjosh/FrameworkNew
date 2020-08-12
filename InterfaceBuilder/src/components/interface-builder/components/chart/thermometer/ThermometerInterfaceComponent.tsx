import React from "react"
import { thermometerManageForm } from "./thermometer-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { get } from "lodash/fp"
import getThermometer from "./components"
import { ThermometerInterfaceComponentProps } from "./types"
import { ThermometerIcon } from "./components/ThermometerIcon"
import getColor from "./components/colors"

export class ThermometerInterfaceComponent extends BaseInterfaceComponent<ThermometerInterfaceComponentProps> {
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
  }

  render(): JSX.Element {
    const { userInterfaceData, valueKey, strokeColor, strokeWidth, fillColor, iconType, height } = this.props
    const value = get(valueKey, userInterfaceData)
    const Thermometer = getThermometer(iconType)

    return (
      <Thermometer
        value={value}
        height={height}
        strokeColor={getColor(strokeColor)}
        strokeWidth={strokeWidth}
        fillColor={getColor(fillColor)}
      />
    )
  }
}
