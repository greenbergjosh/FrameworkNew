import { get, isEmpty, isEqual, set } from "lodash/fp"
import React from "react"
import { queryBuilderManageForm } from "./query-builder-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { QueryBuilder } from "./components/QueryBuilder"
import { QueryBuilderInterfaceComponentProps, QueryBuilderInterfaceComponentState, SchemaType } from "./types"
import { FieldOrGroup, JsonLogicTree, TypedMap } from "react-awesome-query-builder"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"

export class QueryBuilderInterfaceComponent extends BaseInterfaceComponent<
  QueryBuilderInterfaceComponentProps,
  QueryBuilderInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "query",
    defaultValue: {},
  }

  static getLayoutDefinition() {
    return {
      category: "Special",
      name: "query-builder",
      title: "Query Builder",
      icon: "search",
      formControl: false,
      componentDefinition: {
        component: "query-builder",
        label: "Query Builder",
      },
    }
  }

  static manageForm = queryBuilderManageForm

  constructor(props: QueryBuilderInterfaceComponentProps) {
    super(props)
    this.state = {}
  }

  componentDidMount(): void {
    this.updateSchema()
    this.updateQuery()
  }

  componentDidUpdate(prevProps: Readonly<QueryBuilderInterfaceComponentProps>): void {
    this.updateSchema(prevProps)
    this.updateQuery()
  }

  private updateQuery() {
    const { userInterfaceData, valueKey, mode, schemaRaw } = this.props
    const query: JsonLogicTree = get(valueKey, userInterfaceData)

    // Once we have the query, don't update again or we'll wipe out the user's changes
    if (isEmpty(this.state.query) && !isEmpty(query)) {
      this.setState({ query })
    }
  }

  private updateSchema(prevProps?: Readonly<QueryBuilderInterfaceComponentProps>) {
    const { userInterfaceData, valueKey, mode, schemaRaw } = this.props
    const isSchemaUnchanged = (prevProps && isEqual(schemaRaw, prevProps.schemaRaw)) || false

    if (!isEmpty(schemaRaw) && !isSchemaUnchanged) {
      const schema: SchemaType | undefined = tryCatch(() => JSON5.parse(schemaRaw)).toUndefined()
      this.setState({ schema })
    }
  }

  handleChange = (jsonLogic?: JsonLogicTree) => {
    const { defaultValue, onChangeData, userInterfaceData, valueKey } = this.props
    const value = get(valueKey, userInterfaceData) || defaultValue

    if (!isEqual(value, jsonLogic)) {
      onChangeData && onChangeData(set(valueKey, jsonLogic, userInterfaceData))
    }
  }

  render(): JSX.Element {
    return <QueryBuilder schema={this.state.schema} query={this.state.query} onChange={this.handleChange} />
  }
}
