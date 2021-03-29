import { Alert } from "antd"
import jsonLogic from "json-logic-js"
import React from "react"
import { tryCatch } from "../lib/Option"
import { VisibilityIndicator } from "./VisibilityIndicator"
import { FormFieldWrapper } from "./FormFieldWrapper"
import { DraggableWrapper } from "./DraggableWrapper"
import { DebugComponent } from "./DebugComponent"
import { DataBinding } from "./DataBinding/DataBinding"
import { RenderInterfaceComponentProps, RenderInterfaceComponentState } from "./types"
import { LayoutDefinition } from "components/interface-builder/components/base/BaseInterfaceComponent"

export class RenderInterfaceComponent extends React.Component<
  RenderInterfaceComponentProps,
  RenderInterfaceComponentState
> {
  state = { error: null }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("Error rendering component", { props: this.props, error, info })
    this.setState({ error: error.toString() })
  }

  /**
   * Blocked via JsonLogic visibility conditions
   */
  isBlocked(): boolean {
    const { componentDefinition, data } = this.props
    if (componentDefinition.visibilityConditions) {
      return !tryCatch(() => jsonLogic.apply(componentDefinition.visibilityConditions, data)).foldL(
        () => {
          console.warn(
            "Error occurred while processing the visibility conditions in component definition. Component will render as visible.",
            componentDefinition,
            componentDefinition.visibilityConditions
          )
          return true
        },
        (logicResult) => logicResult
      )
    }
    return false
  }

  /**
   *
   * @param layoutDefinition
   */
  createComponent(layoutDefinition: LayoutDefinition): JSX.Element {
    const { Component, componentDefinition, data, mode, onChangeData, onChangeSchema, submit } = this.props
    return (
      <FormFieldWrapper
        isFormControl={layoutDefinition.formControl || false}
        hideLabel={componentDefinition.hideLabel}
        help={componentDefinition.help}
        label={componentDefinition.label}>
        <DataBinding
          componentDefinition={componentDefinition}
          onChangeData={onChangeData}
          onChangeSchema={onChangeSchema}
          userInterfaceData={data}
          mode={mode}>
          <Component
            {...componentDefinition}
            userInterfaceData={data}
            getRootUserInterfaceData={this.props.getRootData}
            mode={mode}
            onChangeData={onChangeData}
            onChangeSchema={onChangeSchema}
            submit={submit}
            userInterfaceSchema={componentDefinition}
          />
        </DataBinding>
      </FormFieldWrapper>
    )
  }

  render(): JSX.Element | null {
    const { Component, componentDefinition, dragDropDisabled, index, mode, path } = this.props

    /* ************************************
     *
     * ERROR mode
     */

    if (this.state.error) {
      return (
        <Alert
          message="Component Error"
          description={`An error occurred while rendering the component: ${componentDefinition.component}`}
          type="error"
        />
      )
    }

    /* ************************************
     *
     * EDIT mode
     */

    if (mode === "edit") {
      const layoutDefinition = Component.getLayoutDefinition()
      return (
        <DraggableWrapper
          componentDefinition={componentDefinition}
          dragDropDisabled={dragDropDisabled}
          index={index}
          title={layoutDefinition.title}
          mode={mode}
          path={path}>
          {Component ? (
            <VisibilityIndicator
              title={layoutDefinition.title}
              invisible={componentDefinition.invisible}
              hidden={componentDefinition.hidden}
              blocked={this.isBlocked()}>
              {this.createComponent(layoutDefinition)}
            </VisibilityIndicator>
          ) : (
            <DebugComponent componentDefinition={componentDefinition} index={index} mode={mode} />
          )}
        </DraggableWrapper>
      )
    }

    /* ************************************
     *
     * DISPLAY and PREVIEW mode
     */

    /* Disabled: User has chosen to make this component
     * not in the DOM and not functioning.
     */
    if (componentDefinition.hidden) {
      return null
    }

    /* Blocked: JsonLogic rules are making this component
     * not in the DOM and not functioning.
     */
    if (this.isBlocked()) {
      return null
    }

    /* Invisible: User has chosen to hide this component
     * but it is still in the DOM and functioning.
     */
    if (componentDefinition.invisible) {
      return <div style={{ display: "none" }}>{this.createComponent(Component.getLayoutDefinition())}</div>
    }

    return this.createComponent(Component.getLayoutDefinition())
  }
}
