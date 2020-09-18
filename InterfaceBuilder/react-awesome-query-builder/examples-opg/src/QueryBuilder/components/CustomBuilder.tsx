import React from "react"
import jsonLogic from "json-logic-js"
import { Button, message } from "antd"
import { Builder, Utils } from "react-awesome-query-builder"
import { CustomBuilderProps } from "../types"
import responseData from "../signal-data/responseData.json"

export function CustomBuilder(props: CustomBuilderProps) {
  const { onReset, onClear, onGenerateList } = props

  const handleGenerateList = () => {
    const { tree, config } = props
    const { logic, data, errors } = Utils.jsonLogicFormat(tree, config)
    const results = responseData.filter((r) => {
      // Test data against rule using jsonLogic
      const isMatch = jsonLogic.apply(
        logic, // Rule
        r // Data
      )
      console.log(isMatch, logic, responseData)
      return isMatch
    })
    if (results.length > 0) message.success("Results found")
    else message.warn("No results found")
    onGenerateList(results)
    console.log(results)
  }

  return (
    <div className="query-builder qb-lite">
      <Builder {...props} />
      <div style={{ textAlign: "right", marginRight: 5, marginTop: 10 }}>
        <Button type="ghost" onClick={onReset} style={{ marginRight: 10 }}>
          Reset
        </Button>
        <Button type="ghost" onClick={onClear} style={{ marginRight: 10 }}>
          Clear
        </Button>
        <Button type="primary" onClick={handleGenerateList} style={{ marginRight: 5 }}>
          Generate List
        </Button>
      </div>
    </div>
  )
}
