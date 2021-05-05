import React from "react"
import { BaseInterfaceComponent, Table, UserInterfaceContext } from "@opg/interface-builder"
import { tableManageForm } from "./table-manage-form"
import { TableInterfaceComponentProps, TableInterfaceComponentState } from "./types"
import { TableWrapper } from "./components/TableWrapper"

export class TableInterfaceComponent extends BaseInterfaceComponent<
  TableInterfaceComponentProps,
  TableInterfaceComponentState
> {
  constructor(props: TableInterfaceComponentProps) {
    super(props)

    this.state = {
      loading: false,
      serialize: () => undefined,
      deserialize: () => undefined,
    }
  }
  context!: React.ContextType<typeof UserInterfaceContext>
  static contextType = UserInterfaceContext
  static defaultProps = Table.TableInterfaceComponent.defaultProps
  static getLayoutDefinition = Table.TableInterfaceComponent.getLayoutDefinition
  static manageForm = tableManageForm

  componentDidMount(): void {
    if (!this.context) {
      console.warn(
        "TableInterfaceComponent",
        "Query cannot load any data without a UserInterfaceContext in the React hierarchy"
      )
    }
  }

  render(): JSX.Element {
    return <TableWrapper {...this.props} />
  }
}
