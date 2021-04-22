import React from "react"
import { JSONRecord } from "../../../../globalTypes/JSONTypes"
import ReactJson from "react-json-view"
import styles from "./styles.scss"

export default function JSONEditor({
  data,
  onChange,
  height,
}: {
  data: JSONRecord | JSONRecord[] | undefined
  onChange: (data: any) => void
  height: number
}) {
  return (
    <div className={styles.jsonViewer} style={{ height }}>
      <ReactJson
        src={data as Record<string, unknown>}
        theme="shapeshifter:inverted"
        collapsed={true}
        iconStyle="square"
        displayObjectSize={false}
        displayDataTypes={false}
        style={{ fontFamily: 'Menlo, Monaco, "Courier New", monospace' }}
        collapseStringsAfterLength={15}
        onAdd={(cx) => {
          console.log("DevTools", "JSONViewer", "onAdd", cx, data)
          onChange(cx.updated_src)
        }}
        onEdit={(cx) => {
          console.log("DevTools", "JSONViewer", "onAdd", cx, data)
          onChange(cx.updated_src)
        }}
        onDelete={(cx) => {
          console.log("DevTools", "JSONViewer", "onAdd", cx, data)
          onChange(cx.updated_src)
        }}
      />
    </div>
  )
}
