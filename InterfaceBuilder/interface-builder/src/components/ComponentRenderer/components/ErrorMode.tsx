import { Alert, Collapse } from "antd"
import React from "react"
import { ErrorModeProps } from "../types"

export function ErrorMode(props: ErrorModeProps): JSX.Element {
  if (props.mode !== "edit") {
    return (
      <Alert
        message={`Error: "${props.componentDefinition.component}" component failed to render.`}
        type="error"
        showIcon={true}
      />
    )
  }

  return (
    <Alert
      message={`Error: "${props.componentDefinition.component}" failed to render.`}
      description={
        <>
          <p>{props.error}</p>
          <Collapse>
            <Collapse.Panel header="Diagnostics" key="2">
              <div style={{ overflow: "scroll", width: "50vw" }}>
                <pre>{JSON.stringify(props, null, 2)}</pre>
              </div>
            </Collapse.Panel>
          </Collapse>
        </>
      }
      type="error"
      showIcon={true}
    />
  )
}
