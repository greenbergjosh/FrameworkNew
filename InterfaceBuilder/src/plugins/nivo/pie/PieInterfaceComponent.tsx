import React from "react"
import { pieManageForm } from "./pie-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { PieDatum, ResponsivePie } from "@nivo/pie"
import { InheritedColorProp } from "@nivo/colors"
import { convertToPieDatum, emptyDataSet, legends } from "./utils"
import { getNivoColorScheme } from "../_shared/nivoColors"
import { isEqual } from "lodash/fp"
import { PieInterfaceComponentProps, PieInterfaceComponentState } from "./types"
import { Icon, Spin } from "antd"
import { parseLBM } from "../../../lib/parseLBM"
import { JSONRecord } from "../../../globalTypes/JSONTypes"
import { LayoutDefinition } from "../../../globalTypes"

export class PieInterfaceComponent extends BaseInterfaceComponent<
  PieInterfaceComponentProps,
  PieInterfaceComponentState
> {
  static getLayoutDefinition(): LayoutDefinition {
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
      pieDatumTooltipFunction: () => null,
    }
  }

  componentDidUpdate(prevProps: Readonly<PieInterfaceComponentProps>): void {
    const prevValue = this.getValue(prevProps.valueKey, prevProps.userInterfaceData, prevProps.getRootUserInterfaceData)
    const nextValue = this.getValue(this.props.valueKey)

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
        valueKey,
        preSorted,
        otherAggregatorFunction,
        otherAggregatorFunctionSrc,
      } = this.props

      const rawData: JSONRecord[] = this.getValue(valueKey)

      const labelValueFunction =
        sliceLabelValueFunction ||
        parseLBM<PieInterfaceComponentProps, { slice: JSONRecord }, string>(sliceLabelValueFunctionSrc)

      const otherSliceAggregatorFunction =
        otherAggregatorFunction ||
        parseLBM<PieInterfaceComponentProps, { slices: JSONRecord[] }, JSONRecord>(otherAggregatorFunctionSrc)

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
        getValue: this.getValue.bind(this),
        setValue: this.setValue.bind(this),
      })

      this.setState({ pieData, loading: false })
    }

    if (this.anyPropsChanged(prevProps, ["useTooltipFunction", "tooltipFunction", "tooltipFunctionSrc"])) {
      this.createTooltipFunction()
    }
  }

  componentDidMount(): void {
    if (this.props.useTooltipFunction && (this.props.tooltipFunction || this.props.tooltipFunctionSrc)) {
      this.createTooltipFunction()
    }
  }

  private createTooltipFunction(): void {
    const { useTooltipFunction, tooltipFunctionSrc, tooltipFunction } = this.props
    if (!useTooltipFunction) {
      this.setState({ pieDatumTooltipFunction: () => null })
    } else {
      const sliceTooltipFunction =
        tooltipFunction || parseLBM<PieInterfaceComponentProps, { slice: JSONRecord }, string>(tooltipFunctionSrc)
      let pieDatumTooltipFunction: PieInterfaceComponentState["pieDatumTooltipFunction"] = () => null
      if (sliceTooltipFunction && this.props.mode !== "edit") {
        pieDatumTooltipFunction = (item: PieDatum) => {
          const datum = this.state.pieData[parseInt(item.id.toString())]
          if (datum) {
            return (
              <div
                dangerouslySetInnerHTML={{
                  __html: sliceTooltipFunction({
                    props: this.props,
                    lib: { getValue: this.getValue.bind(this), setValue: this.setValue.bind(this) },
                    args: { slice: datum.slice },
                  }),
                }}
              />
            )
          }
          return null
        }
      }

      this.setState({ pieDatumTooltipFunction })
    }
  }

  render(): JSX.Element {
    const {
      colorScheme,
      donut = true,
      showLegend = false,
      sliceGap = 2,
      enableRadialLabels = true,
      enableSliceLabels = true,
    } = this.props
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }
    const borderColor: InheritedColorProp = { from: "color", modifiers: [["darker", 0.5]] }

    return (
      <Spin spinning={this.state.loading && this.props.mode === "display"} indicator={<Icon type="loading" />}>
        <div style={{ height: 250 }}>
          <ResponsivePie
            animate={true}
            borderColor={borderColor}
            borderWidth={1}
            colors={getNivoColorScheme<PieDatum>(colorScheme)}
            data={this.state.pieData.map((item) => item.pieDatum) || []}
            enableRadialLabels={enableRadialLabels}
            enableSlicesLabels={enableSliceLabels}
            isInteractive={this.state.pieData !== emptyDataSet}
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
            tooltip={this.state.pieDatumTooltipFunction}
          />
        </div>
      </Spin>
    )
  }
}
