import { get, isEmpty, isEqual, set } from "lodash/fp"
import React from "react"
import { queryBuilderManageForm } from "./query-builder-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { QueryBuilder } from "./components/QueryBuilder"
import {
  OnChangePayloadType,
  QueryBuilderInterfaceComponentProps,
  QueryBuilderInterfaceComponentState,
  SchemaType,
} from "./types"
import { JsonGroup, JsonLogicTree } from "react-awesome-query-builder"
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
    const { userInterfaceData, valueKey, jsonLogicKey } = this.props
    const qbDataJsonGroup: JsonGroup = get(valueKey, userInterfaceData)
    const jsonLogic: JsonLogicTree = get(jsonLogicKey, userInterfaceData)

    // Once we have the qbDataJsonGroup, don't update again or we'll wipe out the user's changes
    if (isEmpty(this.state.qbDataJsonGroup) && !isEmpty(qbDataJsonGroup)) {
      this.setState({ qbDataJsonGroup })
    }

    // Once we have the jsonLogic, don't update again or we'll wipe out the user's changes
    if (isEmpty(this.state.jsonLogic) && !isEmpty(jsonLogic)) {
      this.setState({ jsonLogic })
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
      const queryableFields = getQueryableFields(schema)
      onChangeData && onChangeData(set(queryableFieldsKey!, queryableFields, userInterfaceData))
    }
  }

  handleChange = ({
    jsonLogic: nextJsonLogic,
    data,
    errors,
    qbDataJsonGroup: nextQbDataJsonGroup,
  }: OnChangePayloadType) => {
    const { defaultValue, onChangeData, userInterfaceData, valueKey, jsonLogicKey } = this.props

    if (errors && errors.length > 0) {
      console.error("QueryBuilderInterfaceComponent", "handleChange", {
        errors,
        nextJsonLogic,
        data,
        nextQbData: nextQbDataJsonGroup,
      })
      return
    }

    const prevQbDataJsonGroup: JsonGroup = get(valueKey, userInterfaceData) || defaultValue
    if (!isEqual(prevQbDataJsonGroup, nextQbDataJsonGroup)) {
      onChangeData && onChangeData(set(valueKey, nextQbDataJsonGroup, userInterfaceData))
    }

    const prevJsonLogic = get(jsonLogicKey, userInterfaceData) || defaultValue
    if (!isEqual(prevJsonLogic, nextJsonLogic)) {
      onChangeData && onChangeData(set(jsonLogicKey, nextJsonLogic, userInterfaceData))
    }
  }

  render(): JSX.Element {
    return (
      <QueryBuilder
        schema={this.state.schema}
        qbDataJsonGroup={this.state.qbDataJsonGroup}
        jsonLogic={this.state.jsonLogic}
        onChange={this.handleChange}
      />
    )
  }
}
