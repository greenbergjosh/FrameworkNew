import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { FieldOrGroup, ImmutableTree, JsonLogicResult, JsonLogicTree, TypedMap } from "react-awesome-query-builder"

export interface QueryBuilderInterfaceComponentProps extends ComponentDefinitionNamedProps {
  // IB props
  component: "query-builder"
  defaultValue?: string
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  mode: UserInterfaceProps["mode"]

  // QueryBuilder props
  schemaRaw: string
  query: JsonLogicTree
}

export interface QueryBuilderInterfaceComponentState {
  schema?: TypedMap<FieldOrGroup>
  query?: JsonLogicTree | string
  loading: boolean
}

export interface QueryBuilderProps {
  schema?: TypedMap<FieldOrGroup> // the user defined fields available to query
  query?: JsonLogicTree // the persisted jsonLogic query
  onChange: (jsonLogic?: JsonLogicTree) => void
}
