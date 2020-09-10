import { get, isEmpty, isEqual, set } from "lodash/fp"
import React from "react"
import { queryBuilderManageForm } from "./query-builder-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { QueryBuilder } from "./components/QueryBuilder"
import {
  QueryBuilderInterfaceComponentProps,
  QueryBuilderInterfaceComponentState,
} from "components/interface-builder/components/special/query-builder/types"
import { FieldOrGroup, JsonLogicTree, TypedMap } from "react-awesome-query-builder"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"
import { Spin } from "antd"

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
    this.state = { loading: true }
  }

  componentDidMount(): void {
    const { userInterfaceData, valueKey, mode, schemaRaw } = this.props
    debugger

    if (mode === "edit" || isEmpty(schemaRaw)) {
      return
    }
    const schema: TypedMap<FieldOrGroup> | undefined = tryCatch(() => JSON5.parse(schemaRaw)).toUndefined()

    this.setState({ schema, loading: false })
    const query: JsonLogicTree = get(valueKey, userInterfaceData)

    if (!isEmpty(query)) {
      this.setState({ query, schema })
    }
  }

  componentDidUpdate(prevProps: Readonly<QueryBuilderInterfaceComponentProps>): void {
    const { mode, schemaRaw } = this.props
    debugger

    if (mode === "edit" || isEmpty(schemaRaw) || isEqual(schemaRaw, prevProps.schemaRaw)) {
      return
    }
    const schema: TypedMap<FieldOrGroup> | undefined = tryCatch(() => JSON5.parse(schemaRaw)).toUndefined()

    this.setState({ schema, loading: false })
  }

  handleChange = (jsonLogic?: JsonLogicTree) => {
    const { defaultValue, onChangeData, userInterfaceData, valueKey } = this.props
    const value = get(valueKey, userInterfaceData) || defaultValue

    if (!isEqual(value, jsonLogic)) {
      onChangeData && onChangeData(set(valueKey, jsonLogic, userInterfaceData))
    }
  }

  render(): JSX.Element {
    return (
      <Spin spinning={this.state.loading && this.props.mode === "display"} size="small">
        <QueryBuilder schema={this.state.schema} query={this.state.query} onChange={this.handleChange} />
      </Spin>
    )
  }
}
