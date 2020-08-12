import React from "react"
import { pieManageForm } from "./pie-manage-form"
import { BaseInterfaceComponent, ComponentDefinitionNamedProps } from "../../base/BaseInterfaceComponent"
import { ResponsivePie } from "@nivo/pie"
import { InheritedColorProp } from "@nivo/colors"
import { legends, mapNivoColorScheme, mapDataToNivoData } from "./utils"
import { get } from "lodash/fp"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

export interface PieInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "pie"
  valueKey: string
  userInterfaceData: UserInterfaceProps["data"]

  // Pie props
  colorScheme: string
  donut: boolean
  showLegend: boolean
  sliceLabelKey: string
  sliceValueKey: string
  sliceGap: number
}

export class PieInterfaceComponent extends BaseInterfaceComponent<PieInterfaceComponentProps> {
  static getLayoutDefinition() {
    return {
      category: "Chart",
      name: "pie",
      title: "Pie",
      icon: "pie-chart",
      componentDefinition: {
        component: "pie",
        label: "Pie Chart",
      },
    }
  }

  static manageForm = pieManageForm

  constructor(props: PieInterfaceComponentProps) {
    super(props)
  }

  render(): JSX.Element {
    const {
      colorScheme,
      donut = true,
      showLegend = false,
      sliceLabelKey = "label",
      sliceValueKey = "value",
      sliceGap = 2,
      userInterfaceData,
      valueKey,
    } = this.props
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }
    const borderColor: InheritedColorProp = { from: "color", modifiers: [["darker", 0.2]] }
    const emptyData = [{ id: "None", [sliceLabelKey]: "No data", [sliceValueKey]: 1 }]
    const rawData = get(valueKey, userInterfaceData) || emptyData
    const data = mapDataToNivoData(rawData, sliceLabelKey, sliceValueKey)

    return (
      <div style={{ height: 250 }}>
        <ResponsivePie
          animate={true}
          borderColor={borderColor}
          borderWidth={1}
          colors={mapNivoColorScheme(colorScheme)}
          data={data}
          innerRadius={donut ? 0.5 : undefined}
          legends={showLegend ? legends : undefined}
          margin={margin}
          motionDamping={15}
          motionStiffness={90}
          padAngle={sliceGap}
          radialLabel="label"
          radialLabelsLinkColor={{ from: "color" }}
          radialLabelsLinkDiagonalLength={16}
          radialLabelsLinkHorizontalLength={24}
          radialLabelsLinkOffset={0}
          radialLabelsLinkStrokeWidth={1}
          radialLabelsSkipAngle={10}
          radialLabelsTextColor="#333333"
          radialLabelsTextXOffset={6}
          sliceLabel="value"
          slicesLabelsSkipAngle={10}
          slicesLabelsTextColor="#333333"
        />
      </div>
    )
  }
}
