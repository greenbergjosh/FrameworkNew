import React from "react"
import { pieManageForm } from "./pie-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { PieDatum, PieDatumWithColor, ResponsivePie } from "@nivo/pie"
import { InheritedColorProp } from "@nivo/colors"
import { convertToPieDatum, emptyDataSet, legends } from "./utils"
import { getNivoColorScheme } from "../_shared/nivoColors"
import { isArray, isEqual } from "lodash/fp"
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
      tooltip: () => null,
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
      this.loadData()
    }

    if (this.anyPropsChanged(prevProps, ["useTooltipFunction", "tooltipFunction", "tooltipFunctionSrc"])) {
      this.createTooltipFunction()
    }
  }

  componentDidMount(): void {
    if (this.props.useTooltipFunction && (this.props.tooltipFunction || this.props.tooltipFunctionSrc)) {
      this.createTooltipFunction()
    }
    this.loadData()
  }

  /**
   *
   */
  private loadData() {
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

    if (!isArray(rawData)) {
      return
    }

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

  /**
   *
   */
  private createTooltipFunction(): void {
    const { useTooltipFunction, tooltipFunctionSrc, tooltipFunction } = this.props

    // Turn off custom tooltip when disabled
    if (!useTooltipFunction) {
      this.setState({ tooltip: () => null })
      return
    }
    if (this.props.mode === "edit") {
      return
    }

    // Create tooltip from lbm
    const tooltipLBM =
      tooltipFunction || parseLBM<PieInterfaceComponentProps, { slice: JSONRecord }, string>(tooltipFunctionSrc)
    if (tooltipLBM) {
      /*
       * Create a Nivo pie tooltip function
       * which uses tooltipLBM for customization.
       */
      const tooltip: React.StatelessComponent<PieDatumWithColor> = (pieDatumWithColor) => {
        const { pieDatum, slice } = this.state.pieData[parseInt(pieDatumWithColor.id.toString())]
        if (pieDatum && slice) {
          const __html = tooltipLBM({
            props: this.props,
            lib: { getValue: this.getValue.bind(this), setValue: this.setValue.bind(this) },
            args: { slice, ...this.props.tooltipFunctionParameters },
          })
          return <div dangerouslySetInnerHTML={{ __html }} />
        }
        return null
      }
      this.setState({ tooltip })
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
            tooltip={this.state.tooltip}
          />
        </div>
      </Spin>
    )
  }
}
