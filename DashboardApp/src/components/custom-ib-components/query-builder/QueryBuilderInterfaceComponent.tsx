import React from "react"
import { BaseInterfaceComponent, QueryBuilder, UserInterfaceContext, utils } from "@opg/interface-builder"
import { queryBuilderManageForm } from "./query-builder-manage-form"
import { QueryBuilderInterfaceComponentProps, QueryBuilderInterfaceComponentState } from "./types"
import { loadRemoteLBM } from "../_shared/LBM/loadRemoteLBM"
import { AdminUserInterfaceContextManager } from "../../../data/AdminUserInterfaceContextManager.type"
import { NonEmptyString } from "io-ts-types/lib/NonEmptyString"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"

export class QueryBuilderInterfaceComponent extends BaseInterfaceComponent<
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  QueryBuilderInterfaceComponentProps,
  QueryBuilderInterfaceComponentState
> {
  constructor(props: QueryBuilderInterfaceComponentProps) {
    super(props)

    this.state = {
      schemaRaw: "",
    }
  }
  context!: React.ContextType<typeof UserInterfaceContext>
  static contextType = UserInterfaceContext
  static defaultProps = QueryBuilder.QueryBuilderInterfaceComponent.defaultProps
  static getLayoutDefinition = QueryBuilder.QueryBuilderInterfaceComponent.getLayoutDefinition
  static manageForm = queryBuilderManageForm

  componentDidMount(): void {
    if (!this.context) {
      console.warn(
        "QueryBuilderInterfaceComponent",
        "Query cannot load any data without a UserInterfaceContext in the React hierarchy"
      )
      return
    }
    const { loadById } = this.context as AdminUserInterfaceContextManager
    const remoteSchemaRaw = this.props.schemaRawConfigId && loadById(this.props.schemaRawConfigId)

    if (!remoteSchemaRaw) {
      return
    }
    const { schema } = tryCatch(() => JSON5.parse(remoteSchemaRaw.config.getOrElse(""))).toUndefined()

    schema && this.setState({ schemaRaw: schema })
  }

  render() {
    return <QueryBuilder.QueryBuilderInterfaceComponent {...this.props} schemaRaw={this.state.schemaRaw} />
  }
}
