import React from "react"
import { lineChartManageForm } from "./line-chart-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { ResponsiveLine, Serie } from "@nivo/line"
import { AxisProps } from "@nivo/axes"
import { LegendProps } from "@nivo/legends"
import { emptyDataSet } from "./utils"
import { isEqual } from "lodash/fp"
import {
  LineChartInterfaceComponentProps,
  LineChartInterfaceComponentState,
  ScaleType,
  SerieTooltipFunction,
} from "./types"
import { Icon, Spin } from "antd"
import { parseLBM } from "../../../lib/parseLBM"
import { JSONRecord } from "../../../globalTypes/JSONTypes"
import { getNivoColorScheme } from "../_shared/nivoColors"
import { LayoutDefinition } from "../../../globalTypes"

export class LineChartInterfaceComponent extends BaseInterfaceComponent<
  LineChartInterfaceComponentProps,
  LineChartInterfaceComponentState
> {
  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Chart",
      name: "line-chart",
      title: "Line Chart",
      icon: "line-chart",
      componentDefinition: {
        component: "line-chart",
        label: "Line Chart",
      },
    }
  }

  static manageForm = lineChartManageForm

  constructor(props: LineChartInterfaceComponentProps) {
    super(props)
    this.state = {
      lineChartData: emptyDataSet,
      loading: true,
      tooltipFunction: undefined,
    }
  }

  componentDidUpdate(prevProps: Readonly<LineChartInterfaceComponentProps>): void {
    const prevValue = this.getValue(prevProps.valueKey, prevProps.userInterfaceData, prevProps.getRootUserInterfaceData)
    const nextValue = this.getValue(this.props.valueKey)

    if (!isEqual(prevValue, nextValue) || this.anyPropsChanged(prevProps, ["valueKey"])) {
      const lineChartData: Serie[] = (this.getValue(this.props.valueKey) as unknown) as Serie[]
      if (lineChartData) {
        this.setState({ lineChartData, loading: false })
      }
    }

    if (this.anyPropsChanged(prevProps, ["useTooltipFunction", "tooltipFunction", "tooltipFunctionSrc"])) {
      this.createTooltipFunction()
    }
  }

  componentDidMount() {
    if (this.props.useTooltipFunction && (this.props.tooltipFunction || this.props.tooltipFunctionSrc)) {
      this.createTooltipFunction()
    }

    const lineChartData: Serie[] = (this.getValue(this.props.valueKey) as unknown) as Serie[]
    if (lineChartData) {
      this.setState({ lineChartData, loading: false })
    }
  }

  private createTooltipFunction(): void {
    const { useTooltipFunction, tooltipFunctionSrc, tooltipFunction } = this.props
    if (!useTooltipFunction) {
      this.setState({ tooltipFunction: undefined })
    } else {
      const parsedTooltipFunction = tooltipFunction || parseLBM<SerieTooltipFunction>(tooltipFunctionSrc)
      let wrappedTooltipFunction: ((item: JSONRecord) => JSX.Element | undefined) | undefined

      if (parsedTooltipFunction && this.props.mode !== "edit") {
        wrappedTooltipFunction = (item: JSONRecord) => {
          const datum = this.state.lineChartData[parseInt((item.id && item.id.toString()) || "")]
          if (datum) {
            return <div dangerouslySetInnerHTML={{ __html: parsedTooltipFunction(datum.slice, this.props) }} />
          }
        }
      }

      this.setState({ tooltipFunction: wrappedTooltipFunction })
    }
  }

  render(): JSX.Element {
    const {
      areaBaselineValue = 0,
      areaOpacity = 0.2,
      colorScheme,
      curve = "linear",
      enableArea = false,
      enableGridX = true,
      enableGridY = true,
      enablePointLabel = false,
      enablePoints = true,
      height = 350,
      lineWidth = 2,
      pointBorderWidth = 2,
      pointSize = 6,
      showLegend = false,
      width,
      xFormat,
      xScaleType = "point",
      yFormat,
      yScaleType = "linear",
    } = this.props
    const legends: LegendProps[] = [
      {
        anchor: "bottom-right",
        direction: "column",
        justify: false,
        translateX: 100,
        translateY: 0,
        itemsSpacing: 0,
        itemDirection: "left-to-right",
        itemWidth: 80,
        itemHeight: 20,
        itemOpacity: 0.75,
        symbolSize: 12,
        symbolShape: "circle",
        symbolBorderColor: "rgba(0, 0, 0, .5)",
        effects: [
          {
            on: "hover",
            style: {
              itemBackground: "rgba(0, 0, 0, .03)",
              itemOpacity: 1,
            },
          },
        ],
      },
    ]
    const axisBottom: AxisProps = {
      orient: "bottom",
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "transportation",
      legendOffset: 36,
      legendPosition: "middle",
    }
    const axisLeft: AxisProps = {
      orient: "left",
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "count",
      legendOffset: -40,
      legendPosition: "middle",
    }
    const margin = { top: 50, right: showLegend ? 110 : 50, bottom: 50, left: 50 }
    const xScale: ScaleType = {
      type: xScaleType || "point",
      min: "auto",
      max: "auto",
      stacked: true,
      reverse: false,
    }
    const yScale: ScaleType = {
      type: yScaleType || "linear",
      min: "auto",
      max: "auto",
      stacked: true,
      reverse: false,
    }

    return (
      <Spin spinning={this.state.loading && this.props.mode === "display"} indicator={<Icon type="loading" />}>
        <div style={{ height: height || 350, width }}>
          <ResponsiveLine
            areaBaselineValue={areaBaselineValue}
            areaOpacity={areaOpacity}
            axisBottom={axisBottom}
            axisLeft={axisLeft}
            axisRight={null}
            axisTop={null}
            colors={getNivoColorScheme<Serie[]>(colorScheme)}
            curve={curve}
            data={this.state.lineChartData}
            enableArea={enableArea}
            enableGridX={enableGridX}
            enableGridY={enableGridY}
            enablePointLabel={enablePointLabel}
            enablePoints={enablePoints}
            isInteractive={this.state.lineChartData !== emptyDataSet}
            legends={showLegend ? legends : undefined}
            lineWidth={lineWidth}
            margin={margin}
            pointBorderColor={{ from: "serieColor" }}
            pointBorderWidth={pointBorderWidth}
            pointColor={{ theme: "background" }}
            pointLabelYOffset={-12}
            pointSize={pointSize}
            tooltip={this.state.tooltipFunction}
            useMesh={false}
            xFormat={xFormat}
            xScale={xScale}
            yFormat={yFormat}
            yScale={yScale}
          />
        </div>
      </Spin>
    )
  }
}
