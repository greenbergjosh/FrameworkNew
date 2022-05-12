import React from "react"
import {
  BaseInterfaceComponent,
  UserInterfaceContext,
  UserInterfaceContextManager,
} from "@opg/interface-builder"
import Table from "@opg/interface-builder-plugins/lib/syncfusion/table/TableInterfaceComponent"
import { settings } from "./settings"
import { TableInterfaceComponentProps, TableInterfaceComponentState } from "./types"

export class TableInterfaceComponent extends BaseInterfaceComponent<
  TableInterfaceComponentProps,
  TableInterfaceComponentState
> {
  context!: React.ContextType<typeof UserInterfaceContext>
  static contextType: React.Context<UserInterfaceContextManager | null> = UserInterfaceContext
  static defaultProps = Table.defaultProps
  static getLayoutDefinition = Table.getLayoutDefinition
  static manageForm = settings

  render(): JSX.Element {
    return (
      <div style={{ border: "solid 2px red", borderRadius: 5 }}>
        <Table {...this.props} />
      </div>
    )
  }
}
