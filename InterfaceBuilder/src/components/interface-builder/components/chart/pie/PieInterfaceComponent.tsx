import React from "react"
import { pieManageForm } from "./pie-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { ResponsivePie, PieDatum } from "@nivo/pie"
import { InheritedColorProp } from "@nivo/colors"
import { legends, convertToPieDatum, getNivoColorScheme, emptyDataSet } from "./utils"
import { get, isEqual } from "lodash/fp"
import {
  PieInterfaceComponentProps,
  PieInterfaceComponentState,
  SliceLabelValueFunction,
  SliceTooltipFunction,
  OtherSliceAggregatorFunction,
} from "./types"
import { Spin } from "antd"
import { parseLBM } from "components/interface-builder/components/_shared/LBM/parseLBM"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"

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
    this.state = {
      pieData: emptyDataSet,
      loading: true,
      tooltipFunction: undefined,
    }
  }

  componentDidUpdate(prevProps: Readonly<PieInterfaceComponentProps>): void {
    const prevValue = get(prevProps.valueKey, prevProps.userInterfaceData)
    const nextValue = get(this.props.valueKey, this.props.userInterfaceData)

    if (
      !isEqual(prevValue, nextValue) ||
      this.anyPropsChanged(prevProps, [
        "sliceLabelKey",
        "sliceValueKey",
        "sliceLabelValueType",
        "sliceLabelValueKey",
        "sliceLabelValueFunction",
        "sliceLabelValueFunctionSrc",
        "threshold",
        "valueKey",
        "preSorted",
        "otherAggregatorFunction",
        "otherAggregatorFunctionSrc",
      ])
    ) {
      const {
        sliceLabelKey,
        sliceValueKey,
        sliceLabelValueType,
        sliceLabelValueKey,
        sliceLabelValueFunction,
        sliceLabelValueFunctionSrc,
        threshold,
        userInterfaceData,
        valueKey,
        preSorted,
        otherAggregatorFunction,
        otherAggregatorFunctionSrc,
      } = this.props

      const rawData: JSONRecord[] = get(valueKey, userInterfaceData)

      const labelValueFunction =
        sliceLabelValueFunction || parseLBM<SliceLabelValueFunction>(sliceLabelValueFunctionSrc)

      const otherSliceAggregatorFunction =
        otherAggregatorFunction || parseLBM<OtherSliceAggregatorFunction>(otherAggregatorFunctionSrc)

      const pieData = convertToPieDatum({
        data: rawData,
        labelNameKey: sliceLabelKey,
        labelValueType: sliceLabelValueType,
        labelValueKey: sliceLabelValueKey,
        labelValueFunction,
        valueKey: sliceValueKey,
        dataIsPreSorted: preSorted,
        threshold,
        otherSliceAggregatorFunction,
        props: this.props,
      })

      this.setState({ pieData, loading: false })
    }

    if (this.anyPropsChanged(prevProps, ["useTooltipFunction", "tooltipFunction", "tooltipFunctionSrc"])) {
      this.createTooltipFunction()
    }
  }

  componentDidMount() {
    if (this.props.useTooltipFunction && (this.props.tooltipFunction || this.props.tooltipFunctionSrc)) {
      this.createTooltipFunction()
    }
  }

  private createTooltipFunction(): void {
    const { useTooltipFunction, tooltipFunctionSrc, tooltipFunction } = this.props
    if (!useTooltipFunction) {
      this.setState({ tooltipFunction: undefined })
    } else {
      const me = this
      const parsedTooltipFunction = tooltipFunction || parseLBM<SliceTooltipFunction>(tooltipFunctionSrc)
      let wrappedTooltipFunction: Function | undefined
      if (parsedTooltipFunction && this.props.mode !== "edit") {
        wrappedTooltipFunction = function (item: PieDatum) {
          const datum = me.state.pieData[parseInt(item.id.toString())]
          if (datum) {
            return <div dangerouslySetInnerHTML={{ __html: parsedTooltipFunction(datum.slice, me.props) }} />
          }
        }
      }

      this.setState({ tooltipFunction: wrappedTooltipFunction })
    }
  }

  render(): JSX.Element {
    const { colorScheme, donut = true, showLegend = false, sliceGap = 2 } = this.props
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
            data={this.state.pieData.map((item) => item.pieDatum) || []}
            isInteractive={this.state.pieData != emptyDataSet}
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
            tooltip={this.state.tooltipFunction}
          />
        </div>
      </Spin>
    )
  }
}
