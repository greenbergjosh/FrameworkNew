import React from "react"
import { ComponentModifierProps } from "../types"
import { ComposableFn } from "lib/compose"

export const withRender: ComposableFn<React.ComponentType<ComponentModifierProps>> = (Wrapper) => {
  return (hocProps: ComponentModifierProps) => {
    const { Component } = hocProps

    return (
      <Wrapper
        componentDefinition={hocProps.componentDefinition}
        getRootUserInterfaceData={hocProps.getRootUserInterfaceData}
        mode={hocProps.mode}
        onChangeData={hocProps.onChangeData}
        onChangeRootData={hocProps.onChangeRootData}
        onChangeSchema={hocProps.onChangeSchema}
        submit={hocProps.submit}
        userInterfaceData={hocProps.userInterfaceData}>
        {Component && (
          <Component
            {...hocProps.componentDefinition}
            getRootUserInterfaceData={hocProps.getRootUserInterfaceData}
            mode={hocProps.mode}
            onChangeData={hocProps.onChangeData}
            onChangeRootData={hocProps.onChangeRootData}
            onChangeSchema={hocProps.onChangeSchema}
            submit={hocProps.submit}
            userInterfaceData={hocProps.userInterfaceData}
            userInterfaceSchema={hocProps.componentDefinition}
          />
        )}
      </Wrapper>
    )
  }
}
