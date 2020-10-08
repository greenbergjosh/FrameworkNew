import React from "react"
import { BaseInterfaceComponent, Table, UserInterfaceContext } from "@opg/interface-builder"
import { tableManageForm } from "./table-manage-form"
import { TableInterfaceComponentState, TableInterfaceComponentProps } from "./types"
import { TableWrapper } from "./components/TableWrapper"
import { some } from "fp-ts/lib/Option"

export class TableInterfaceComponent extends BaseInterfaceComponent<
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  TableInterfaceComponentProps,
  TableInterfaceComponentState
> {
  constructor(props: TableInterfaceComponentProps) {
    super(props)

    this.state = {
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

  // TODO: Provide TableWrapper with parentData and parameterValues
  //  to support QueryParams component, otherwise, this component
  //  won't respond to things like the querystring Query Params.
  //  For now we just provide default values for parentData and parameterValues.

  render() {
    return <TableWrapper {...this.props} parentData={{}} parameterValues={some({})} />
  }
}
