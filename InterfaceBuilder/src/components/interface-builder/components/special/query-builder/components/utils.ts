import { Config, JsonTree, Utils } from "react-awesome-query-builder"
import AntdConfig from "react-awesome-query-builder/lib/config/antd"
import { SchemaType } from "../types"
import { keys } from "lodash/fp"

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

export const emptyQBDataJsonTree: JsonTree = { id: Utils.uuid(), type: "group" }

export function getQueryableFields(schema: SchemaType): string[] {
  const ownKeys = keys(schema)
  return ownKeys.reduce((acc: string[], key) => {
    const prop = schema[key]
    if (prop && prop.type && !prop.type.endsWith("group")) {
      acc.push(key)
    }
    return acc
  }, [])
}
