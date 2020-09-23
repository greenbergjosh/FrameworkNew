import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { FieldOrGroup, JsonGroup, JsonLogicResult, JsonLogicTree, TypedMap } from "react-awesome-query-builder"

export type SchemaType = TypedMap<FieldOrGroup>

export interface QueryBuilderInterfaceComponentProps extends ComponentDefinitionNamedProps {
  // IB props
  component: "query-builder"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string // aka, qbData Key
  mode: UserInterfaceProps["mode"]

  // QueryBuilder props
  jsonLogicKey: string
  schemaKey: string
  exposeQueryableFields: boolean
  queryableFieldsKey?: string
}

export interface QueryBuilderInterfaceComponentState {
  schema?: SchemaType
  jsonLogic?: JsonLogicTree | string
  qbDataJsonGroup?: JsonGroup
}

/* **************************
 * onChange Event Interface
 */

export type OnChangePayloadType = {
  jsonLogic: JsonLogicResult["logic"]
  errors: JsonLogicResult["errors"]
  data: JsonLogicResult["data"] // Contains all used fields with null values ("template" data)
  qbDataJsonGroup: JsonGroup
}

/* **********************
 * QueryBuilder
 */

export interface QueryBuilderProps {
  schema?: SchemaType // the user defined fields available to query
  jsonLogic?: JsonLogicTree // the persisted jsonLogic query
  qbDataJsonGroup?: JsonGroup // the persisted QueryBuilder query
  onChange: (result: OnChangePayloadType) => void
}
