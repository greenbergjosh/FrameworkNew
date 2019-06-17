import {
  Alert,
  Form,
  Icon,
  Tooltip
  } from "antd"
import React from "react"
import { Draggable } from "./dnd"
import { UserInterfaceProps } from "./UserInterface"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
} from "./components/base/BaseInterfaceComponent"

interface RenderInterfaceComponentProps {
  Component: typeof BaseInterfaceComponent
  componentDefinition: ComponentDefinition
  index: number
  mode: UserInterfaceProps["mode"]
  path: string
}

interface RenderInterfaceComponentState {
  error: null | string
}

export class RenderInterfaceComponent extends React.Component<
  RenderInterfaceComponentProps,
  RenderInterfaceComponentState
> {
  state = { error: null }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error rendering component", { props: this.props, error, info })
    this.setState({ error: error.toString() })
  }

  render() {
    const { Component, componentDefinition, index, mode, path } = this.props
    const { error } = this.state

    if (error) {
      return (
        <Alert
          message="Component Error"
          description={`An error occurred while rendering the component: ${
            componentDefinition.component
          }`}
          type="error"
        />
      )
    }

    if (!Component) {
      console.error(`Missing Component ${componentDefinition.component}`, {
        componentDefinition,
        index,
        mode,
      })
    }

    const layoutDefintion =
      Component && Component.getLayoutDefinition && Component.getLayoutDefinition()

    const content = Component ? (
      <Component
        {...componentDefinition}
        mode={mode}
        onDataChanged={(props: unknown) => {
          console.log("Update User Interface Data", props)
        }}
        onStateChanged={(props: unknown) => {
          console.log("Update User Interface State", props)
        }}
      />
    ) : (
      <DebugComponent componentDefinition={componentDefinition} index={index} mode={mode} />
    )

    const helpContent = !!componentDefinition.help && (
      <Tooltip title={componentDefinition.help}>
        <Icon type="question-circle-o" />
      </Tooltip>
    )

    const wrapper =
      componentDefinition.label && componentDefinition.hideLabel !== true ? (
        layoutDefintion && layoutDefintion.formControl ? (
          <Form.Item
            label={
              <>
                {componentDefinition.label} {helpContent}
              </>
            }>
            {content}
          </Form.Item>
        ) : (
          <div className="label-wrapper">
            <label>
              {componentDefinition.label} {helpContent}
            </label>
            {content}
          </div>
        )
      ) : (
        content
      )

    return mode === "edit" ? (
      <Draggable
        data={componentDefinition}
        draggableId={path}
        index={index}
        type="INTERFACE_COMPONENT">
        {({ isDragging }) => {
          return wrapper
        }}
      </Draggable>
    ) : (
      wrapper
    )
  }
}
const DebugComponent = (props: any) => (
  <Alert closable={false} message={<pre>{JSON.stringify(props, null, 2)}</pre>} type="warning" />
)
