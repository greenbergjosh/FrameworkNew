import React from "react"
import { BaseInterfaceComponent, Pie, UserInterfaceContext, utils } from "@opg/interface-builder"
import { pieManageForm } from "./pie-manage-form"
import {
  OtherSliceAggregatorFunctionWithParameters,
  PieInterfaceComponentProps,
  PieInterfaceComponentState,
  SliceLabelValueFunctionWithParameters,
  SliceTooltipFunctionWithParameters,
} from "./types"
import { loadRemoteLBM } from "../../_shared/LBM/loadRemoteLBM"
import { AdminUserInterfaceContextManager } from "../../../../data/AdminUserInterfaceContextManager.type"

export class PieInterfaceComponent extends BaseInterfaceComponent<
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  PieInterfaceComponentProps,
  PieInterfaceComponentState
> {
  constructor(props: PieInterfaceComponentProps) {
    super(props)

    this.state = {
      sliceLabelValueFunction: undefined,
      tooltipFunction: undefined,
      otherAggregatorFunction: undefined,
    }
  }

  context!: React.ContextType<typeof UserInterfaceContext>
  static contextType = UserInterfaceContext
  static getLayoutDefinition = Pie.PieInterfaceComponent.getLayoutDefinition
  static manageForm = pieManageForm

  componentDidMount(): void {
    if (!this.context) {
      console.warn(
        "PieInterfaceComponent",
        "Query cannot load any data without a UserInterfaceContext in the React hierarchy"
      )
      return
    }

    const { loadById } = this.context as AdminUserInterfaceContextManager
    const sliceLabelValueFunctionSrc = loadRemoteLBM(loadById, this.props.sliceLabelValueFunctionConfigId)
    const tooltipFunctionSrc = loadRemoteLBM(loadById, this.props.tooltipFunctionConfigId)
    const otherAggregatorFunctionSrc = loadRemoteLBM(loadById, this.props.otherAggregatorFunctionConfigId)

    const sliceLabelValueFunction = this.getFunctionWithParameters<
      SliceLabelValueFunctionWithParameters,
      Pie.SliceLabelValueFunction
    >(sliceLabelValueFunctionSrc, this.props.sliceLabelValueFunctionParameters)

    const tooltipFunction = this.getFunctionWithParameters<
      SliceTooltipFunctionWithParameters,
      Pie.SliceTooltipFunction
    >(tooltipFunctionSrc, this.props.tooltipFunctionParameters)

    const otherAggregatorFunction = this.getFunctionWithParameters<
      OtherSliceAggregatorFunctionWithParameters,
      Pie.OtherSliceAggregatorFunction
    >(otherAggregatorFunctionSrc, this.props.otherAggregatorFunctionParameters)

    sliceLabelValueFunction && this.setState({ sliceLabelValueFunction })
    tooltipFunction && this.setState({ tooltipFunction })
    otherAggregatorFunction && this.setState({ otherAggregatorFunction })
  }

  getFunctionWithParameters<
    FunctionTypeWithParams extends (params: { [key: string]: string }) => FunctionType,
    FunctionType extends Pie.SliceLabelValueFunction | Pie.SliceTooltipFunction | Pie.OtherSliceAggregatorFunction
  >(source: string | undefined, params: { [key: string]: string }): FunctionType | undefined {
    if (!source) {
      return undefined
    }

    const functionWithParameters = utils.parseLBM<FunctionTypeWithParams>(source)
    if (!functionWithParameters) {
      return undefined
    }

    return functionWithParameters(params || {})
  }

  render(): JSX.Element {
    return (
      <Pie.PieInterfaceComponent
        {...this.props}
        sliceLabelValueFunction={this.state.sliceLabelValueFunction}
        tooltipFunction={this.state.tooltipFunction}
        otherAggregatorFunction={this.state.otherAggregatorFunction}
      />
    )
  }
}
