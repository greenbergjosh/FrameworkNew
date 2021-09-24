import "react-awesome-query-builder/lib/css/compact_styles.css"
import "react-awesome-query-builder/lib/css/styles.css"
import React from "react"
import { Builder, BuilderProps, Config, ImmutableTree, Query, Utils } from "react-awesome-query-builder"
import { Empty } from "antd"
import { emptyQBDataJsonTree, getConfig } from "./utils"
import { isEmpty } from "lodash/fp"
import { QueryBuilderProps } from "../types"

export function QueryBuilder({
  schema,
  jsonLogic,
  qbDataJsonGroup,
  onChange,
  onError,
}: QueryBuilderProps): JSX.Element {
  /* *********************************
   * STATE
   */
  const [qbData, setQBData] = React.useState(Utils.loadTree(emptyQBDataJsonTree))
  const [qbDataChildren1Size, setQBDataChildren1Size] = React.useState(0)
  const [isEditing, setIsEditing] = React.useState(false)

  /* *********************************
   * PROP WATCHERS
   */

  const config: Config = React.useMemo(() => {
    return getConfig(schema)
  }, [schema])

  /**
   * Load qbDataJsonGroup into the Builder on initial load
   */
  React.useEffect(() => {
    console.log("QueryBuilder", "useEffect", { schema, qbDataJsonGroup, jsonLogic, isEditing })
    // Without a schema the query can't be properly mapped to UI controls
    if (isEmpty(schema)) {
      return
    }
    // Once the user has started editing, we no longer update the query from external sources
    if (isEditing) {
      return
    }

    /*
     * Convert qbDataJsonGroup to ImmutableTree.
     * qbData (ImmutableTree) is QueryBuilder's native data.
     */
    if (qbDataJsonGroup && !isEmpty(qbDataJsonGroup)) {
      const uncheckedQbData = Utils.loadTree(qbDataJsonGroup)
      const qbData = Utils.checkTree(uncheckedQbData, config)
      const isValid = Utils.isValidTree(qbData)
      if (!isValid) {
        console.error("QueryBuilder", "Tree is not valid!", { uncheckedQbData, qbData })
        onError &&
          onError({
            type: "data-read",
            message: "Error when reading data into Query Builder. Data tree is not valid!",
          })
      }

      setIsEditing(true)
      setQBData(qbData)
    }
  }, [config, isEditing, jsonLogic, qbDataJsonGroup, schema, onError])

  /* *********************************
   * EVENT HANDLERS
   */

  /**
   * Update parent with the current query
   * @param nextQBData - QueryBuilder's internal data structure
   */
  const handleChange = (nextQBData: ImmutableTree): void => {
    // The user has begun creating a query
    setIsEditing(true)

    setQBDataChildren1Size((nextQBData.get("children1") as any).size)

    // Convert qbData tree to jsonLogic
    const { logic, errors, data } = Utils.jsonLogicFormat(nextQBData, config)

    // Convert qbData to JsonGroup
    const qbDataJsonGroup = Utils.getTree(nextQBData)

    console.log("QueryBuilder", "handleChange", { jsonLogic: logic, errors, data, qbDataJsonGroup })
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
          {qbDataChildren1Size < 1 && (
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
