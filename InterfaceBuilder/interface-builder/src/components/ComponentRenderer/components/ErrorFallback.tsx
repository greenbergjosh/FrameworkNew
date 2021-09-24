import React from "react"
import { ErrorMode } from "./ErrorMode"
import { ErrorModeProps } from "../types"
import { FallbackProps } from "react-error-boundary"

export const ErrorFallback = (props: Omit<ErrorModeProps, "error">) => (fallbackProps: FallbackProps) => {
  const {
    componentDefinition,
    dragDropDisabled,
    getRootUserInterfaceData,
    onChangeRootData,
    index,
    mode,
    path,
    userInterfaceData,
    onChangeData,
    onChangeSchema,
    submit,
  } = props
  console.error("Error rendering component", { props, error: fallbackProps.error })
  return (
    <ErrorMode
      componentDefinition={componentDefinition}
      onChangeData={onChangeData}
      onChangeSchema={onChangeSchema}
      userInterfaceData={userInterfaceData}
      dragDropDisabled={dragDropDisabled}
      index={index}
      mode={mode}
      path={path}
      getRootUserInterfaceData={getRootUserInterfaceData}
      onChangeRootData={onChangeRootData}
      submit={submit}
      error={fallbackProps.error && fallbackProps.error.message}
    />
  )
}
