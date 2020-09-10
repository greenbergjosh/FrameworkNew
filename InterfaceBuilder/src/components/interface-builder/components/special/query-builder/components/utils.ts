import { Config, FieldOrGroup, JsonLogicTree, JsonTree, TypedMap, Utils } from "react-awesome-query-builder"
import AntdConfig from "react-awesome-query-builder/lib/config/antd"

/* **************************************************
 *
 * CONFIG
 */

/**
 *
 * @param schema - User defined fields to add to the config.
 */
export function getConfig(schema?: TypedMap<FieldOrGroup>): Config {
  if (!schema) {
    return {
      ...AntdConfig,
      fields: {
        ...AntdConfig.fields,
      },
    }
  }
  return {
    ...AntdConfig,
    fields: {
      ...AntdConfig.fields,
      ...schema,
    },
  }
}

/**
 *
 * @param schema - User defined fields to add to the config.
 */
export function hasSchema(schema?: TypedMap<FieldOrGroup>): boolean {
  return (schema && Object.keys(schema).length > 0) || false
}

export const emptyQBData: JsonTree = { id: Utils.uuid(), type: "group" }

export function getDefaultedQuery(query: JsonLogicTree): JsonLogicTree {
  return query && Object.keys(query).length > 0 ? query : emptyQBData
}
