import React from "react"
import { BaseInterfaceComponent, Table, UserInterfaceContext } from "@opg/interface-builder"
import { tableManageForm } from "./table-manage-form"
import { TableInterfaceComponentProps, TableInterfaceComponentState } from "./types"

export class TableInterfaceComponent extends BaseInterfaceComponent<
  TableInterfaceComponentProps,
  TableInterfaceComponentState
> {
  context!: React.ContextType<typeof UserInterfaceContext>
  static contextType = UserInterfaceContext
  static defaultProps = Table.TableInterfaceComponent.defaultProps
  static getLayoutDefinition = Table.TableInterfaceComponent.getLayoutDefinition
  static manageForm = tableManageForm

  render() {
    return (
      <div style={{ border: "solid 2px red", borderRadius: 5 }}>
        <Table.TableInterfaceComponent {...this.props} />
      </div>
    )
  }
}
