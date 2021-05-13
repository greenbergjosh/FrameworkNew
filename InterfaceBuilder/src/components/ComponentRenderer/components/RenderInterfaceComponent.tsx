import React from "react"
import { RenderInterfaceComponentProps, RenderInterfaceComponentState } from "../types"
import { EditMode } from "components/ComponentRenderer/components/EditMode"
import { PreviewMode } from "components/ComponentRenderer/components/PreviewMode"
import { DisplayMode } from "components/ComponentRenderer/components/DisplayMode"
import { ErrorMode } from "components/ComponentRenderer/components/ErrorMode.js"

export class RenderInterfaceComponent extends React.Component<
  RenderInterfaceComponentProps,
  RenderInterfaceComponentState
> {
  state = { error: null }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("Error rendering component", { props: this.props, error, info })
    this.setState({ error: error.toString() })
  }

  render(): JSX.Element | null {
    const {
      Component,
      componentDefinition,
      dragDropDisabled,
      getRootData,
      index,
      mode,
      path,
      userInterfaceData,
      onChangeData,
      onChangeSchema,
      submit,
    } = this.props

    if (this.state.error) {
      return (
        <ErrorMode
          componentDefinition={componentDefinition}
          onChangeData={onChangeData}
          onChangeSchema={onChangeSchema}
          userInterfaceData={userInterfaceData}
          dragDropDisabled={dragDropDisabled}
          index={index}
          layoutDefinition={Component && Component.getLayoutDefinition()}
          mode={mode}
          path={path}
          rootUserInterfaceData={getRootData.bind(this)}
          submit={submit}
          Component={Component}
          error={this.state.error}
        />
      )
    }

    switch (this.props.mode) {
      case "display":
        return (
          <DisplayMode
            componentDefinition={componentDefinition}
            onChangeData={onChangeData}
            onChangeSchema={onChangeSchema}
            layoutDefinition={Component.getLayoutDefinition()}
            userInterfaceData={userInterfaceData}
            rootUserInterfaceData={getRootData.bind(this)}
            mode={mode}
            submit={submit}
            Component={Component}
          />
        )
      case "preview":
        return (
          <PreviewMode
            componentDefinition={componentDefinition}
            onChangeData={onChangeData}
            onChangeSchema={onChangeSchema}
            layoutDefinition={Component.getLayoutDefinition()}
            userInterfaceData={userInterfaceData}
            rootUserInterfaceData={getRootData.bind(this)}
            mode={mode}
            submit={submit}
            Component={Component}
          />
        )
      case "edit":
        return (
          <EditMode
            componentDefinition={componentDefinition}
            onChangeData={onChangeData}
            onChangeSchema={onChangeSchema}
            userInterfaceData={userInterfaceData}
            dragDropDisabled={dragDropDisabled}
            layoutDefinition={Component.getLayoutDefinition()}
            index={index}
            mode={mode}
            path={path}
            rootUserInterfaceData={getRootData.bind(this)}
            submit={submit}
            Component={Component}
          />
        )
    }
  }
}
