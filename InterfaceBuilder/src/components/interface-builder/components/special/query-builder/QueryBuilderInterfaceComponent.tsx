import { get, isEmpty, isEqual, set } from "lodash/fp"
import React from "react"
import { queryBuilderManageForm } from "./query-builder-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { QueryBuilder } from "./components/QueryBuilder"
import { QueryBuilderInterfaceComponentProps, QueryBuilderInterfaceComponentState, SchemaType } from "./types"
import { JsonLogicResult, JsonLogicTree } from "react-awesome-query-builder"
import { getQueryableFields } from "./components/utils"

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
    const { userInterfaceData, valueKey } = this.props
    const query: JsonLogicTree = get(valueKey, userInterfaceData)

    // Once we have the query, don't update again or we'll wipe out the user's changes
    if (isEmpty(this.state.query) && !isEmpty(query)) {
      this.setState({ query })
    }
  }

  private updateSchema(prevProps?: Readonly<QueryBuilderInterfaceComponentProps>) {
    const { schemaKey, userInterfaceData } = this.props
    const schema: SchemaType = get(schemaKey, userInterfaceData)
    const prevSchema: SchemaType = prevProps && get(prevProps.schemaKey, prevProps.userInterfaceData)
    const isSchemaUnchanged = (prevProps && isEqual(schema, prevSchema)) || false

    if (!isEmpty(schemaKey) && !isSchemaUnchanged) {
      this.provideQueryableFields(schema)
      this.setState({ schema })
    }
  }

  private provideQueryableFields(schema: SchemaType | undefined) {
    const { userInterfaceData, exposeQueryableFields, onChangeData, queryableFieldsKey } = this.props
    if (schema && exposeQueryableFields && !isEmpty(queryableFieldsKey)) {
      const queryableFelds = getQueryableFields(schema)
      onChangeData && onChangeData(set(queryableFieldsKey!, queryableFelds, userInterfaceData))
    }
  }

  handleChange = ({ logic, data, errors }: JsonLogicResult) => {
    const { defaultValue, onChangeData, userInterfaceData, valueKey } = this.props
    const value = get(valueKey, userInterfaceData) || defaultValue

    if (errors && errors.length > 0) {
      console.error("QueryBuilderInterfaceComponent", "handleChange", { errors, logic, data })
      return
    }

    if (!isEqual(value, logic)) {
      onChangeData && onChangeData(set(valueKey, logic, userInterfaceData))
    }
  }

  render(): JSX.Element {
    return <QueryBuilder schema={this.state.schema} query={this.state.query} onChange={this.handleChange} />
  }
}
