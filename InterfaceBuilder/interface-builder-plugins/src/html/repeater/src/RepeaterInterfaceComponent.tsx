import React from "react"
import { BaseInterfaceComponent, JSONRecord, LayoutDefinition } from "@opg/interface-builder"
import { EditMode } from "./components/EditMode"
import { DisplayMode } from "./components/DisplayMode"
import { isEmpty } from "lodash/fp"
import { RepeaterInterfaceComponentProps } from "./types"
import { settings } from "./settings"
import layoutDefinition from "./layoutDefinition"

export default class RepeaterInterfaceComponent extends BaseInterfaceComponent<RepeaterInterfaceComponentProps> {
  static defaultProps = {
    allowDelete: true,
    allowReorder: true,
    userInterfaceData: {},
    valueKey: "data",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = settings

  handleChange = (nextState: JSONRecord | JSONRecord[], subpath?: string): void => {
    const { valueKey, userInterfaceData } = this.props
    const path = !isEmpty(subpath) ? `${valueKey}${subpath}` : valueKey
    this.setValue([path, nextState, userInterfaceData])
  }

  render(): JSX.Element | undefined {
    const { components, getRootUserInterfaceData, onChangeRootData, valueKey, mode } = this.props
    const data = this.getValue(valueKey) || []

    if (mode === "edit") {
      return (
        <EditMode
          components={components}
          data={data}
          getRootUserInterfaceData={getRootUserInterfaceData}
          onChangeRootData={onChangeRootData}
          onChange={this.handleChange}
        />
      )
    }

    return (
      <DisplayMode
        components={components}
        data={data}
        getRootUserInterfaceData={getRootUserInterfaceData}
        onChangeRootData={onChangeRootData}
        onChange={this.handleChange}
      />
    )
  }
}
