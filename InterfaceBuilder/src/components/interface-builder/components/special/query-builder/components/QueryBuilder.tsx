import React, { useState } from "react"
import { Builder, BuilderProps, Config, ImmutableTree, Query, Utils } from "react-awesome-query-builder"
import "react-awesome-query-builder/lib/css/styles.css"
import "react-awesome-query-builder/lib/css/compact_styles.css"
import { emptyQBDataJsonTree, getConfig } from "./utils"
import { QueryBuilderProps } from "../types"
import { Empty, Spin } from "antd"
import { isEmpty } from "lodash/fp"

export function QueryBuilder({ schema, jsonLogic, qbDataJsonGroup, onChange }: QueryBuilderProps) {
  /* *********************************
   * STATE
   */
  const [qbData, setQBData] = React.useState(Utils.loadTree(emptyQBDataJsonTree))
  const [hasData, setHasData] = React.useState(false)

  /* *********************************
   * PROP WATCHERS
   */
  const config: Config = React.useMemo(() => {
    return getConfig(schema)
  }, [schema])

  /**
   * Load query into the Builder
   * Sources can be qbData (ImmutableTree) which is QueryBuilder's native data, or jsonLogic which is converted to qbData
   */
  React.useEffect(() => {
    // Without a schema the query can't be properly mapped to UI controls
    if (isEmpty(schema)) {
      return
    }

    // We have qbDataJsonGroup so convert it to ImmutableTree
    if (!hasData && qbDataJsonGroup && !isEmpty(qbDataJsonGroup)) {
      const uncheckedQbData = Utils.loadTree(qbDataJsonGroup)
      const qbData = Utils.checkTree(uncheckedQbData, config)
      setHasData(true)
      setQBData(qbData)
    }

    // We have jsonLogic, so create qbData from it
    if (!hasData && jsonLogic && !isEmpty(jsonLogic)) {
      const uncheckedQBData = Utils.loadFromJsonLogic(jsonLogic, config)
      const qbData = uncheckedQBData ? Utils.checkTree(uncheckedQBData, config) : Utils.loadTree(emptyQBDataJsonTree)
      setHasData(true)
      setQBData(qbData)
    }
  }, [schema, jsonLogic, qbDataJsonGroup])

  const isQueryChildless: boolean = React.useMemo(() => {
    const children1 = qbData && qbData.get("children1")
    if (children1) {
      // @ts-ignore
      return children1.size < 1
    }
    return true
  }, [qbData])

  /* *********************************
   * EVENT HANDLERS
   */

  /**
   * Update parent with the current query
   * @param nextQBData - QueryBuilder's internal data structure
   */
  const handleChange = (nextQBData: ImmutableTree): void => {
    // The user has begun creating a query
    setHasData(true)

    // Convert qbData tree to jsonLogic
    const { logic, errors, data } = Utils.jsonLogicFormat(nextQBData, config)

    // Convert qbData (Builder's internal data structure) to Json
    const qbDataJsonGroup = Utils.getTree(nextQBData)

    // Forward event to parent
    onChange && onChange({ jsonLogic: logic, errors, data, qbDataJsonGroup })
  }

  /* *********************************
   * RENDER
   */

  if (isEmpty(schema)) {
    return <Empty description="Please provide a valid schema to build a query" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <Query
      {...config}
      value={qbData}
      onChange={handleChange}
      renderBuilder={(builderProps: BuilderProps) => (
        <div className="query-builder qb-lite">
          <Builder {...builderProps} />
          {isQueryChildless && (
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
