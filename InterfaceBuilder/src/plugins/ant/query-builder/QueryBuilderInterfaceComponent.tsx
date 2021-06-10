import { isEmpty, isEqual, isString } from "lodash/fp"
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
import { ComponentDefinition, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes"
import { KVPTuple } from "components/BaseInterfaceComponent/types"

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
    const { schemaKey, valueKey } = this.props

    /* Schema */
    if (!isEmpty(schemaKey)) {
      const rawSchema = this.getValue(schemaKey)

      if (!isEmpty(rawSchema)) {
        this.updateSchema(rawSchema)
      }
    }

    /* qbDataJsonGroup */
    if (!isEmpty(valueKey)) {
      const rawQbDataJsonGroup = this.getValue(valueKey)

      if (!isEmpty(rawQbDataJsonGroup)) {
        this.updateQbDataJsonGroup(rawQbDataJsonGroup)
      }
    }
  }

  componentDidUpdate(prevProps: Readonly<QueryBuilderInterfaceComponentProps>): void {
    const { schemaKey, valueKey } = this.props

    /* Schema */
    if (!isEmpty(schemaKey)) {
      const prevRawSchema = this.getValue(
        prevProps.schemaKey,
        prevProps.userInterfaceData,
        prevProps.getRootUserInterfaceData
      )
      const rawSchema = this.getValue(schemaKey)

      if (!isEmpty(rawSchema) && !isEqual(rawSchema, prevRawSchema)) {
        this.updateSchema(rawSchema)
      }
    }

    /* qbDataJsonGroup */
    if (!isEmpty(valueKey)) {
      const prevRawQuery = this.getValue(
        prevProps.valueKey,
        prevProps.userInterfaceData,
        prevProps.getRootUserInterfaceData
      )
      const rawQbDataJsonGroup = this.getValue(valueKey)

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
  private updateSchema(rawSchema: ComponentDefinition) {
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
    const { exposeQueryableFields, queryableFieldsKey } = this.props

    if (schema && exposeQueryableFields && !isEmpty(queryableFieldsKey)) {
      const queryableFields: UserInterfaceProps["data"] = getQueryableFields(schema)
      queryableFieldsKey && this.setValue([queryableFieldsKey, queryableFields])
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
    const { defaultValue, valueKey, jsonLogicKey } = this.props
    console.log("QueryBuilderInterfaceComponent", "handleChange", "starting")

    if (errors && errors.length > 0) {
      console.error("QueryBuilderInterfaceComponent", "handleChange", {
        errors,
        nextJsonLogic,
        data,
        nextQbData: nextQbDataJsonGroup,
      })
      return
    }

    // Put current JsonGroup into userInterfaceData
    const prevQbDataJsonGroup: JsonGroup = this.getValue(valueKey) || defaultValue
    const kvpTuples: KVPTuple[] = []
    if (!isEqual(prevQbDataJsonGroup, nextQbDataJsonGroup)) {
      kvpTuples.push([valueKey, nextQbDataJsonGroup])
    }

    // Put current jsonLogic into userInterfaceData
    const prevJsonLogic = this.getValue(jsonLogicKey) || defaultValue
    if (!isEqual(prevJsonLogic, nextJsonLogic)) {
      kvpTuples.push([jsonLogicKey, nextJsonLogic])
    }

    this.setValue(kvpTuples)
    console.log("QueryBuilderInterfaceComponent", "handleChange", "finished")
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
