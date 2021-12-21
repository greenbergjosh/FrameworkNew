import React from "react"
import { ErrorModeProps } from "../types"
import { FallbackProps } from "react-error-boundary"
import styles from "./styles.scss"
import { Collapse, Icon } from "antd"

export const ErrorMode = (props: Omit<ErrorModeProps, "error">) => (fallbackProps: FallbackProps) => {
  console.error("Error rendering component", { props, error: fallbackProps.error })
  return (
    <Collapse className={styles.errorCollapse}>
      <Collapse.Panel
        header={`Error: "${props.componentDefinition.component}" component failed to render.`}
        extra={<Icon type="close-circle" theme="filled" />}
        key="2">
        <code>{fallbackProps.error && fallbackProps.error.message}</code>
        <code>{JSON.stringify(props, null, 2)}</code>
      </Collapse.Panel>
    </Collapse>
  )
}
