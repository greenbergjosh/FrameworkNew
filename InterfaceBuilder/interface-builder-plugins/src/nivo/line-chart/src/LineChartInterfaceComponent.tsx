import React from "react"
import { AxisProps } from "@nivo/axes"
import { BaseInterfaceComponent, EventBus, JSONRecord, LayoutDefinition, utils } from "@opg/interface-builder"
import { emptyDataSet } from "./utils"
import { getNivoColorScheme } from "@opg/interface-builder-plugins/lib/nivo/shared"
import { Icon, Spin } from "antd"
import { isEqual } from "lodash/fp"
import { LegendProps } from "@nivo/legends"
import { LineChartInterfaceComponentProps, LineChartInterfaceComponentState, ScaleType } from "./types"
import { settings } from "./settings"
import { ResponsiveLine, Serie } from "@nivo/line"
import layoutDefinition from "./layoutDefinition"

export default class LineChartInterfaceComponent extends BaseInterfaceComponent<
  LineChartInterfaceComponentProps,
  LineChartInterfaceComponentState
> {
  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  constructor(props: LineChartInterfaceComponentProps) {
    super(props)
    this.state = {
      lineChartData: emptyDataSet,
      loading: true,
      pointTooltipFunction: undefined,
    }
  }

  componentDidUpdate(prevProps: Readonly<LineChartInterfaceComponentProps>): void {
    const prevValue = this.getValue(prevProps.valueKey, prevProps.userInterfaceData, prevProps.getRootUserInterfaceData)
    const nextValue = this.getValue(this.props.valueKey)

    if (!isEqual(prevValue, nextValue) || this.anyPropsChanged(prevProps, ["valueKey"])) {
      const lineChartData: Serie[] = this.getValue(this.props.valueKey) as unknown as Serie[]
      if (lineChartData) {
        this.setState({ lineChartData, loading: false })
      }
    }

    if (this.anyPropsChanged(prevProps, ["useTooltipFunction", "tooltipFunction", "tooltipFunctionSrc"])) {
      this.createTooltipFunction()
    }
  }

  componentDidMount(): void {
    if (this.props.useTooltipFunction && (this.props.tooltipFunction || this.props.tooltipFunctionSrc)) {
      this.createTooltipFunction()
    }

    const lineChartData: Serie[] = this.getValue(this.props.valueKey) as unknown as Serie[]
    if (lineChartData) {
      this.setState({ lineChartData, loading: false })
    }
  }

  private createTooltipFunction(): void {
    const { useTooltipFunction, tooltipFunctionSrc, tooltipFunction } = this.props
    if (!useTooltipFunction) {
      this.setState({ pointTooltipFunction: undefined })
    } else {
      const parsedTooltipFunction =
        tooltipFunction ||
        utils.parseLBM<LineChartInterfaceComponentProps, { serie: Serie }, string>(tooltipFunctionSrc)
      let pointTooltipFunction: LineChartInterfaceComponentState["pointTooltipFunction"]

      if (parsedTooltipFunction && this.props.mode !== "edit") {
        pointTooltipFunction = (item: JSONRecord) => {
          const datum = this.state.lineChartData[parseInt((item.id && item.id.toString()) || "")]
          if (datum) {
            return (
              <div
                dangerouslySetInnerHTML={{
                  __html: parsedTooltipFunction({
                    props: this.props,
                    lib: {
                      getValue: this.getValue.bind(this),
                      setValue: this.setValue.bind(this),
                      raiseEvent: EventBus.raiseEvent,
                    },
                    args: { serie: datum.slice },
                  }),
                }}
              />
            )
          }
        }
      }

      this.setState({ pointTooltipFunction })
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
            tooltip={this.state.pointTooltipFunction as any}
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
