import React from "react"
import { UserInterfaceProps } from "../../../UserInterface"
import { columnManageForm } from "./column-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "../../base/BaseInterfaceComponent"

export interface ColumnInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "column"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

export class ColumnInterfaceComponent extends BaseInterfaceComponent<
  ColumnInterfaceComponentProps
> {
  static defaultProps = {
    addItemLabel: "Add Item",
    orientation: "vertical",
    interleave: "none",
    userInterfaceData: {},
    valueKey: "data",
  }

  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "column",
      title: "Columns",
      icon: "project",
      componentDefinition: {
        component: "column",
        components: [],
      },
    }
  }

  static manageForm = columnManageForm

  render() {
    const {} = this.props

    return <div>Columns</div>
  }
}
