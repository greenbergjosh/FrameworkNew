import React from "react"
import { lineChartManageForm } from "./line-chart-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { ResponsiveLine, Serie } from "@nivo/line"
import { AxisProps } from "@nivo/axes"
import { LegendProps } from "@nivo/legends"
import { emptyDataSet } from "./utils"
import { get, isEqual } from "lodash/fp"
import { LineChartInterfaceComponentProps, LineChartInterfaceComponentState, SerieTooltipFunction } from "./types"
import { Icon, Spin } from "antd"
import { parseLBM } from "components/interface-builder/components/_shared/LBM/parseLBM"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"
import { getNivoColorScheme } from "../_shared/colors"

export class LineChartInterfaceComponent extends BaseInterfaceComponent<
  LineChartInterfaceComponentProps,
  LineChartInterfaceComponentState
> {
  static getLayoutDefinition() {
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
    const prevValue = get(prevProps.valueKey, prevProps.userInterfaceData)
    const nextValue = get(this.props.valueKey, this.props.userInterfaceData)

    if (!isEqual(prevValue, nextValue) || this.anyPropsChanged(prevProps, ["valueKey"])) {
      const lineChartData: Serie[] = (this.getValue(this.props.valueKey) as unknown) as Serie[]
      this.setState({ lineChartData, loading: false })
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
    this.setState({ lineChartData, loading: false })
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
    const { showLegend, height = 350, xScaleType = "point", yScaleType = "linear" } = this.props
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
    const xScale = {
      type: xScaleType,
    }
    const yScale: any = {
      type: yScaleType,
      min: "auto",
      max: "auto",
      stacked: true,
      reverse: false,
    }

    return (
      <Spin spinning={this.state.loading && this.props.mode === "display"} indicator={<Icon type="loading" />}>
        <div style={{ height }}>
          <ResponsiveLine
            tooltip={this.state.tooltipFunction}
            isInteractive={this.state.lineChartData !== emptyDataSet}
            colors={getNivoColorScheme<Serie[]>(this.props.colorScheme)}
            data={this.state.lineChartData}
            margin={margin}
            xScale={xScale}
            yScale={yScale}
            yFormat=" >-.2f"
            axisTop={null}
            axisRight={null}
            axisBottom={axisBottom}
            axisLeft={axisLeft}
            pointSize={10}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={false}
            legends={showLegend ? legends : undefined}
          />
        </div>
      </Spin>
    )
  }
}
