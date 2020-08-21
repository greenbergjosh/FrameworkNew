import React from "react"
import { pieManageForm } from "./pie-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { ResponsivePie } from "@nivo/pie"
import { InheritedColorProp } from "@nivo/colors"
import { emptyDataSet, legends, convertToPieDatum, getNivoColorScheme } from "./utils"
import { get, isEqual } from "lodash/fp"
import { PieInterfaceComponentProps, PieInterfaceComponentState } from "./types"
import { Spin } from "antd"

export class PieInterfaceComponent extends BaseInterfaceComponent<
  PieInterfaceComponentProps,
  PieInterfaceComponentState
> {
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
    this.state = { pieDatum: emptyDataSet, loading: true }
  }

  componentDidUpdate(prevProps: Readonly<PieInterfaceComponentProps>): void {
    const prevValue = get(prevProps.valueKey, prevProps.userInterfaceData)
    const nextValue = get(this.props.valueKey, this.props.userInterfaceData)

    if (isEqual(prevValue, nextValue)) return
    const {
      sliceLabelKey,
      sliceLabelValueFunction,
      sliceLabelValueKey,
      sliceValueKey,
      threshold,
      userInterfaceData,
      valueKey,
    } = this.props
    const rawData = get(valueKey, userInterfaceData)
    const data = convertToPieDatum({
      data: rawData,
      labelNameKey: sliceLabelKey,
      labelValueFunction: sliceLabelValueFunction,
      labelValueKey: sliceLabelValueKey,
      threshold,
      valueKey: sliceValueKey,
    })

    this.setState({ pieDatum: data, loading: false })
  }

  render(): JSX.Element {
    const {
      colorScheme,
      donut = true,
      showLegend = false,
      sliceGap = 2,
      sliceLabelKey,
      sliceLabelValueKey,
    } = this.props
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }
    const borderColor: InheritedColorProp = { from: "color", modifiers: [["darker", 0.5]] }

    return (
      <Spin spinning={this.state.loading && this.props.mode === "display"} size="small">
        <div style={{ height: 250 }}>
          <ResponsivePie
            animate={true}
            borderColor={borderColor}
            borderWidth={1}
            colors={getNivoColorScheme(colorScheme)}
            data={this.state.pieDatum || []}
            innerRadius={donut ? 0.5 : undefined}
            legends={showLegend ? legends : undefined}
            margin={margin}
            motionDamping={15}
            motionStiffness={90}
            padAngle={sliceGap}
            radialLabel={sliceLabelKey}
            radialLabelsLinkDiagonalLength={16}
            radialLabelsLinkHorizontalLength={24}
            radialLabelsLinkOffset={0}
            radialLabelsLinkStrokeWidth={1}
            radialLabelsSkipAngle={10}
            radialLabelsTextColor="#333333"
            radialLabelsTextXOffset={6}
            sliceLabel={sliceLabelValueKey}
            slicesLabelsSkipAngle={10}
            slicesLabelsTextColor="#333333"
          />
        </div>
      </Spin>
    )
  }
}
