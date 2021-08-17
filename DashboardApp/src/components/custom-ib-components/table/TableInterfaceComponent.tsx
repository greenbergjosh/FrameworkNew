import React from "react"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  Table,
  UserInterfaceContext,
  UserInterfaceContextManager,
} from "@opg/interface-builder"
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
  static contextType: React.Context<UserInterfaceContextManager | null> = UserInterfaceContext
  static defaultProps = Table.TableInterfaceComponent.defaultProps
  static getLayoutDefinition = Table.TableInterfaceComponent.getLayoutDefinition
  static manageForm = tableManageForm

  /**
   *
   */
  static getSummary(props: Partial<ComponentDefinitionNamedProps>): JSX.Element | undefined {
    return (
      <>
        <div>
          <strong>API Key:</strong> {props.valueKey}
        </div>
        <div>
          <strong>Loading Key:</strong> {props.loadingKey}
        </div>
      </>
    )
  }

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
