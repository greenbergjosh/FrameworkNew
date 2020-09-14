import { Config, FieldOrGroup, JsonLogicTree, JsonTree, TypedMap, Utils } from "react-awesome-query-builder"
import AntdConfig from "react-awesome-query-builder/lib/config/antd"
import { SchemaType } from "../types"
import { keys, isArray } from "lodash/fp"

/**
 *
 * @param schema - User defined fields to add to the config.
 */
export function getConfig(schema?: SchemaType): Config {
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
export function hasSchema(schema?: SchemaType): boolean {
  return (schema && Object.keys(schema).length > 0) || false
}

export const emptyQBData: JsonTree = { id: Utils.uuid(), type: "group" }

export function getQueryOrDefault(query: JsonLogicTree): JsonLogicTree {
  return query && Object.keys(query).length > 0 ? query : emptyQBData
}

export function getQueryableFields(schema: SchemaType): string[] {
  const ownKeys = keys(schema)
  return ownKeys.reduce((acc: string[], key) => {
    const prop = schema[key]
    if (!prop.type.endsWith("group")) {
      acc.push(key)
    }
    return acc
  }, [])
}
