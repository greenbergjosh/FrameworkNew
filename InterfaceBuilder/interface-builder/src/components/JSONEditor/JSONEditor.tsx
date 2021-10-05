import React from "react"
import ReactJson from "react-json-view"
import styles from "./styles.scss"
import { JSONEditorProps } from "./types"
import { cloneDeep } from "lodash/fp"

export function JSONEditor({
  data,
  onChange,
  height = 100,
  collapsed = true,
  displayDataTypes = false,
}: JSONEditorProps): JSX.Element {
  const safeData: Record<string, unknown> | unknown[] = cloneDeep(data) || {}
  return (
    <div className={styles.jsonViewer} style={{ height }}>
      <ReactJson
        src={safeData}
        theme="shapeshifter:inverted"
        collapsed={collapsed}
        iconStyle="square"
        displayObjectSize={false}
        displayDataTypes={displayDataTypes}
        style={{ fontFamily: 'Menlo, Monaco, "Courier New", monospace' }}
        collapseStringsAfterLength={15}
        onAdd={(cx) => onChange(cx.updated_src)}
        onEdit={(cx) => onChange(cx.updated_src)}
        onDelete={(cx) => onChange(cx.updated_src)}
      />
    </div>
  )
}
