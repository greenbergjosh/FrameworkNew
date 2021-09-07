import React from "react"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { Text } from "./components/Text"
import { TextInterfaceComponentProps, TextInterfaceComponentState } from "./types"
import { textManageForm } from "./text-manage-form"
import layoutDefinition from "./layoutDefinition"

export default class TextInterfaceComponent extends BaseInterfaceComponent<
  TextInterfaceComponentProps,
  TextInterfaceComponentState
> {
  constructor(props: TextInterfaceComponentProps) {
    super(props)
  }

  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
    showBorder: true,
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = textManageForm

  render(): JSX.Element {
    return <Text {...this.props} data={this.getValue(this.props.valueKey)} />
  }
}
