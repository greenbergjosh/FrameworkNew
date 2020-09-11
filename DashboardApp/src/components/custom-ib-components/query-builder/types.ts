import { QueryBuilder } from "@opg/interface-builder"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"

export interface QueryBuilderInterfaceComponentProps extends QueryBuilder.QueryBuilderInterfaceComponentProps {
  schemaRawConfigId: PersistedConfig["id"]
}
export interface QueryBuilderInterfaceComponentState extends QueryBuilder.QueryBuilderInterfaceComponentState {
  schemaRaw: string
}
