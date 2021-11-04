import React from "react"
import { BaseInterfaceComponent, UserInterfaceContext, UserInterfaceContextManager } from "@opg/interface-builder"
import Pie from "@opg/interface-builder-plugins/lib/nivo/pie/PieInterfaceComponent"
import { pieManageForm } from "./pie-manage-form"
import { PieInterfaceComponentProps, PieInterfaceComponentState } from "./types"
import { loadRemoteLBM } from "../../lib/loadRemoteLBM"
import { AdminUserInterfaceContextManager } from "../../data/AdminUserInterfaceContextManager.type"

export default class PieInterfaceComponent extends BaseInterfaceComponent<
  PieInterfaceComponentProps,
  PieInterfaceComponentState
> {
  constructor(props: PieInterfaceComponentProps) {
    super(props)

    this.state = {
      sliceLabelValueFunctionSrc: undefined,
      sliceTooltipFunctionSrc: undefined,
      otherAggregatorFunctionSrc: undefined,
    }
  }
  context!: React.ContextType<typeof UserInterfaceContext>
  static contextType: React.Context<UserInterfaceContextManager | null> = UserInterfaceContext
  static getLayoutDefinition = Pie.getLayoutDefinition
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
    const sliceTooltipFunctionSrc = loadRemoteLBM(loadById, this.props.tooltipFunctionConfigId)
    const otherAggregatorFunctionSrc = loadRemoteLBM(loadById, this.props.otherAggregatorFunctionConfigId)

    sliceLabelValueFunctionSrc && this.setState({ sliceLabelValueFunctionSrc })
    sliceTooltipFunctionSrc && this.setState({ sliceTooltipFunctionSrc })
    otherAggregatorFunctionSrc && this.setState({ otherAggregatorFunctionSrc })
  }

  render(): JSX.Element {
    return (
      <Pie
        {...this.props}
        sliceLabelValueFunctionSrc={this.state.sliceLabelValueFunctionSrc}
        tooltipFunctionSrc={this.state.sliceTooltipFunctionSrc}
        otherAggregatorFunctionSrc={this.state.otherAggregatorFunctionSrc}
      />
    )
  }
}
