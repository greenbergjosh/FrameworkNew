import React from "react"
import {
  BaseInterfaceComponent,
  UserInterfaceContext,
  UserInterfaceContextManager,
} from "@opg/interface-builder"
import * as Table from "@opg/interface-builder-plugins/lib/syncfusion/table"
import { tableManageForm } from "./table-manage-form"
import { TableInterfaceComponentProps, TableInterfaceComponentState } from "./types"

export class TableInterfaceComponent extends BaseInterfaceComponent<
  TableInterfaceComponentProps,
  TableInterfaceComponentState
> {
  context!: React.ContextType<typeof UserInterfaceContext>
  static contextType: React.Context<UserInterfaceContextManager | null> = UserInterfaceContext
  static defaultProps = Table.TableInterfaceComponent.defaultProps
  static getLayoutDefinition = Table.TableInterfaceComponent.getLayoutDefinition
  static manageForm = tableManageForm

  render(): JSX.Element {
    return (
      <div style={{ border: "solid 2px red", borderRadius: 5 }}>
        <Table.TableInterfaceComponent {...this.props} />
      </div>
    )
  }
}
