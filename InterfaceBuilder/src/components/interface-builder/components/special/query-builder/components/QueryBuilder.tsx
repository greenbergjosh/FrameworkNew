import React from "react"
import { Builder, BuilderProps, Config, ImmutableTree, Query, Utils } from "react-awesome-query-builder"
import "react-awesome-query-builder/lib/css/styles.css"
import "react-awesome-query-builder/lib/css/compact_styles.css"
import { emptyQBData, getConfig, getDefaultedQuery, hasSchema } from "./utils"
import { QueryBuilderProps } from "../types"
import { Empty } from "antd"

const { checkTree, loadFromJsonLogic, loadTree } = Utils

export function QueryBuilder({ schema, query, onChange }: QueryBuilderProps) {
  /* *********************************
   * STATE
   */

  const [isQueryEmpty, setIsQueryEmpty] = React.useState(true)

  /* *********************************
   * PROP WATCHERS
   */

  const { config, qbData }: { config?: Config; qbData: ImmutableTree } = React.useMemo(() => {
    if (!hasSchema(schema)) {
      return { qbData: loadTree(emptyQBData) }
    }

    const config = getConfig(schema)
    const defaultedQuery = query && getDefaultedQuery(query)
    const rawQBData = defaultedQuery && loadFromJsonLogic(defaultedQuery, config)
    const qbData = rawQBData ? checkTree(rawQBData, config) : loadTree(emptyQBData)

    return { config, qbData }
  }, [schema, query])

  /* *********************************
   * EVENT HANDLERS
   */

  /**
   *
   * @param nextQBData - QueryBuilder's internal data structure
   */
  const handleChange = (nextQBData: ImmutableTree /*config: Config*/): void => {
    if (!config) {
      return
    }

    // Convert qbData tree to jsonLogic
    const { logic, data, errors } = Utils.jsonLogicFormat(nextQBData, config)

    // Forward event to parent
    onChange && onChange(logic)
    if (logic) {
      setIsQueryEmpty(false)
    } else {
      setIsQueryEmpty(true)
    }
  }

  /* *********************************
   * RENDER
   */

  if (config) {
    return (
      <Query
        {...config}
        value={qbData}
        onChange={handleChange}
        renderBuilder={(builderProps: BuilderProps) => (
          <div className="query-builder qb-lite">
            <Builder {...builderProps} />
            {isQueryEmpty && (
              <Empty
                description="Add a group, filter, and at least one rule to create a query"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        )}
      />
    )
  }

  return <Empty description="Please provide a valid schema to build a query" image={Empty.PRESENTED_IMAGE_SIMPLE} />
}
