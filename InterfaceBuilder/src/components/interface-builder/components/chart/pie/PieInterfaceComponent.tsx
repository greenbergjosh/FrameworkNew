import React from "react"
import { pieManageForm } from "./pie-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { ResponsivePie } from "@nivo/pie"
import { InheritedColorProp } from "@nivo/colors"
import { emptyDataSet, legends, convertToPieDatum, getNivoColorScheme } from "./utils"
import { get, isEqual } from "lodash/fp"
import { PieInterfaceComponentProps, PieInterfaceComponentState } from "./types"
import { Spin } from "antd"
import { tryCatch } from "fp-ts/lib/Option"

export class PieInterfaceComponent extends BaseInterfaceComponent<PieInterfaceComponentProps,
  PieInterfaceComponentState> {
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
      sliceValueKey,
      sliceLabelValueType,
      sliceLabelValueKey,
      sliceLabelValueFunction,
      threshold,
      userInterfaceData,
      valueKey,
      preSorted,
      otherAggregatorFunction,
    } = this.props
    const rawData = get(valueKey, userInterfaceData)
    const data = convertToPieDatum({
      data: rawData,
      labelNameKey: sliceLabelKey,
      labelValueType: sliceLabelValueType,
      labelValueKey: sliceLabelValueKey,
      labelValueFunction: sliceLabelValueFunction,
      valueKey: sliceValueKey,
      dataIsPreSorted: preSorted,
      threshold,
      otherAggregatorFunction,
    })

    this.setState({ pieDatum: data, loading: false })
  }

  render(): JSX.Element {
    const {
      colorScheme,
      donut = true,
      showLegend = false,
      sliceGap = 2,
      useTooltipFunction,
      tooltipFunction,
    } = this.props
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }
    const borderColor: InheritedColorProp = { from: "color", modifiers: [["darker", 0.5]] }
    const parsedTooltipFunction =
      useTooltipFunction && tooltipFunction && tryCatch(() => new Function(`return ${tooltipFunction}`)()).toUndefined()
    let wrappedTooltipFunction: any | undefined = undefined
    if (parsedTooltipFunction && this.props.mode !== "edit") {
      wrappedTooltipFunction = function(item: { data: any }) {
        return (<div dangerouslySetInnerHTML={{ __html: parsedTooltipFunction(item.data) }}/>)
      }
    }

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
            radialLabel="label"
            radialLabelsLinkDiagonalLength={16}
            radialLabelsLinkHorizontalLength={24}
            radialLabelsLinkOffset={0}
            radialLabelsLinkStrokeWidth={1}
            radialLabelsSkipAngle={10}
            radialLabelsTextColor="#333333"
            radialLabelsTextXOffset={6}
            sliceLabel="sliceLabel"
            slicesLabelsSkipAngle={10}
            slicesLabelsTextColor="#333333"
            tooltip={wrappedTooltipFunction}
          />
        </div>
      </Spin>
    )
  }
}
