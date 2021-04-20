import { get, isEmpty, isEqual, isString, set } from "lodash/fp"
import React from "react"
import { queryBuilderManageForm } from "./query-builder-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { QueryBuilder } from "./components/QueryBuilder"
import {
  OnChangePayloadType,
  QueryBuilderInterfaceComponentProps,
  QueryBuilderInterfaceComponentState,
  SchemaType,
} from "./types"
import { JsonGroup } from "react-awesome-query-builder"
import { emptyQBDataJsonTree, getQueryableFields } from "./components/utils"
import { tryCatch } from "fp-ts/lib/Option"
import { LayoutDefinition } from "../../../globalTypes"

export class QueryBuilderInterfaceComponent extends BaseInterfaceComponent<
  QueryBuilderInterfaceComponentProps,
  QueryBuilderInterfaceComponentState
> {
  static defaultProps = {
    valueKey: "query",
    defaultValue: {},
  }

  static getLayoutDefinition(): LayoutDefinition {
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
    this.state = {
      schema: undefined,
      jsonLogic: undefined,
      qbDataJsonGroup: undefined,
    }
  }

  componentDidMount(): void {
    const { schemaKey, valueKey, userInterfaceData } = this.props
    console.log("QueryBuilderInterfaceComponent", "componentDidMount", { userInterfaceData })

    /* Schema */
    if (!isEmpty(schemaKey)) {
      const rawSchema = get(schemaKey, userInterfaceData)

      if (!isEmpty(rawSchema)) {
        this.updateSchema(rawSchema)
      }
    }

    /* qbDataJsonGroup */
    if (!isEmpty(valueKey)) {
      const rawQbDataJsonGroup = get(valueKey, userInterfaceData)

      if (!isEmpty(rawQbDataJsonGroup)) {
        this.updateQbDataJsonGroup(rawQbDataJsonGroup)
      }
    }
  }

  componentDidUpdate(prevProps: Readonly<QueryBuilderInterfaceComponentProps>): void {
    const { schemaKey, valueKey, userInterfaceData } = this.props
    console.log("QueryBuilderInterfaceComponent", "componentDidUpdate", { userInterfaceData })

    /* Schema */
    if (!isEmpty(schemaKey)) {
      const prevRawSchema = get(prevProps.schemaKey, prevProps.userInterfaceData)
      const rawSchema = get(schemaKey, userInterfaceData)

      if (!isEmpty(rawSchema) && !isEqual(rawSchema, prevRawSchema)) {
        this.updateSchema(rawSchema)
      }
    }

    /* qbDataJsonGroup */
    if (!isEmpty(valueKey)) {
      const prevRawQuery = get(prevProps.valueKey, prevProps.userInterfaceData)
      const rawQbDataJsonGroup = get(valueKey, userInterfaceData)

      if (!isEmpty(rawQbDataJsonGroup) && !isEqual(rawQbDataJsonGroup, prevRawQuery)) {
        this.updateQbDataJsonGroup(rawQbDataJsonGroup)
      }
    }
  }

  /**
   * Get the JsonGroup (persisted qbData) from userInterfaceData
   */
  private updateQbDataJsonGroup(rawQbDataJsonGroup: any) {
    const qbDataJsonGroup: JsonGroup = isString(rawQbDataJsonGroup)
      ? tryCatch(() => rawQbDataJsonGroup && JSON.parse(rawQbDataJsonGroup)).getOrElse(emptyQBDataJsonTree)
      : rawQbDataJsonGroup || emptyQBDataJsonTree

    this.setState({ qbDataJsonGroup })
  }

  /**
   * Get the schema from userInterfaceData
   * @param rawSchema
   */
  private updateSchema(rawSchema: any) {
    const schema: SchemaType = isString(rawSchema)
      ? tryCatch(() => rawSchema && JSON.parse(rawSchema)).toUndefined()
      : rawSchema

    this.exposeQueryableFields(schema)
    this.setState({ schema })
  }

  /**
   * Creates a list of queryable fields and exposes it on userInterfaceData
   * @param schema
   */
  private exposeQueryableFields(schema: SchemaType | undefined) {
    const { userInterfaceData, exposeQueryableFields, onChangeData, queryableFieldsKey } = this.props

    if (schema && exposeQueryableFields && !isEmpty(queryableFieldsKey)) {
      const queryableFields = getQueryableFields(schema)
      onChangeData && onChangeData(set(queryableFieldsKey!, queryableFields, userInterfaceData))
    }
  }

  /**
   * Output changes from QueryBuilder to userInterfaceData
   */
  handleChange = ({
    jsonLogic: nextJsonLogic,
    data,
    errors,
    qbDataJsonGroup: nextQbDataJsonGroup,
  }: OnChangePayloadType) => {
    const { defaultValue, onChangeData, userInterfaceData, valueKey, jsonLogicKey } = this.props
    console.log("QueryBuilderInterfaceComponent", "handleChange", "starting", { userInterfaceData })

    if (errors && errors.length > 0) {
      console.error("QueryBuilderInterfaceComponent", "handleChange", {
        errors,
        nextJsonLogic,
        data,
        nextQbData: nextQbDataJsonGroup,
      })
      return
    }

    let newData = userInterfaceData

    // Put current JsonGroup into userInterfaceData
    const prevQbDataJsonGroup: JsonGroup = get(valueKey, userInterfaceData) || defaultValue
    if (!isEqual(prevQbDataJsonGroup, nextQbDataJsonGroup)) {
      newData = set(valueKey, nextQbDataJsonGroup, newData)
    }

    // Put current jsonLogic into userInterfaceData
    const prevJsonLogic = get(jsonLogicKey, userInterfaceData) || defaultValue
    if (!isEqual(prevJsonLogic, nextJsonLogic)) {
      newData = set(jsonLogicKey, nextJsonLogic, newData)
    }

    console.log("QueryBuilderInterfaceComponent", "handleChange", "finished", { newData })
    onChangeData && onChangeData(newData)
  }

  render(): JSX.Element {
    return (
      <QueryBuilder
        schema={this.state.schema}
        qbDataJsonGroup={this.state.qbDataJsonGroup}
        jsonLogic={this.state.jsonLogic}
        onChange={this.handleChange}
        onError={this.props.onError}
      />
    )
  }
}
