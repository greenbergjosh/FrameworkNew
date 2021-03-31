import { Alert } from "antd"
import React from "react"
import { FormFieldWrapper } from "./FormFieldWrapper"
import { DraggableWrapper } from "./DraggableWrapper"
import { DataBinding } from "./DataBinding/DataBinding"
import { EditDataBinding } from "./componentModifiers/EditDataBinding/EditDataBinding"
import { RenderInterfaceComponentProps, RenderInterfaceComponentState } from "./types"
import { Visibility } from "./componentModifiers/Visibility/Visibility"
import { DebugComponent } from "components/interface-builder/RenderInterfaceComponent/DebugComponent"
import { isEmpty } from "lodash/fp"

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
      index,
      mode,
      path,
      userInterfaceData,
      onChangeData,
      onChangeSchema,
      submit,
    } = this.props

    /*
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
    if (isEmpty(Component)) {
      return (
        <DebugComponent
          componentDefinition={this.props.componentDefinition}
          index={this.props.index}
          mode={this.props.mode}
        />
      )
    }

    /*
     * DISPLAY, EDIT, PREVIEW, modes
     */
    const layoutDefinition = Component.getLayoutDefinition()

    return (
      <DataBinding
        componentDefinition={componentDefinition}
        onChangeData={onChangeData}
        onChangeSchema={onChangeSchema}
        userInterfaceData={userInterfaceData}>
        <DraggableWrapper
          componentDefinition={componentDefinition}
          dragDropDisabled={dragDropDisabled}
          index={index}
          layoutDefinition={layoutDefinition}
          mode={mode}
          path={path}>
          <Visibility
            componentDefinition={componentDefinition}
            layoutDefinition={layoutDefinition}
            mode={mode}
            userInterfaceData={userInterfaceData}>
            <FormFieldWrapper componentDefinition={componentDefinition} layoutDefinition={layoutDefinition}>
              <EditDataBinding
                componentDefinition={componentDefinition}
                mode={mode}
                onChangeData={onChangeData}
                onChangeSchema={onChangeSchema}
                userInterfaceData={userInterfaceData}>
                <Component
                  {...componentDefinition}
                  userInterfaceData={userInterfaceData}
                  getRootUserInterfaceData={this.props.getRootData}
                  mode={mode}
                  onChangeData={onChangeData}
                  onChangeSchema={onChangeSchema}
                  submit={submit}
                  userInterfaceSchema={componentDefinition}
                />
              </EditDataBinding>
            </FormFieldWrapper>
          </Visibility>
        </DraggableWrapper>
      </DataBinding>
    )
  }
}
