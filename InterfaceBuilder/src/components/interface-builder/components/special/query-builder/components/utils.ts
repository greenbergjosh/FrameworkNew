import { AntdConfig, Config, JsonTree, Utils } from "react-awesome-query-builder"
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
    settings: {
      ...AntdConfig.settings,
      showErrorMessage: true,
    },
  }
}

export const emptyQBDataJsonTree: JsonTree = { id: Utils.uuid(), type: "group" }

type QueryableFieldOption = { label: string; value: string }

export function getQueryableFields(schema: SchemaType): QueryableFieldOption[] {
  const ownKeys = keys(schema)
  return ownKeys.reduce((acc: QueryableFieldOption[], key) => {
    const prop = schema[key]
    if (prop && prop.type && !prop.type.endsWith("group")) {
      acc.push({ label: prop.label || key, value: key })
    }
    return acc
  }, [])
}
