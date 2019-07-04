import {
  Alert,
  Form,
  Icon,
  Tooltip
  } from "antd"
import jsonLogic from "json-logic-js"
import React from "react"
import { Draggable } from "./dnd"
import { EditUserInterfaceProps, UserInterfaceProps } from "./UserInterface"
import {
  BaseInterfaceComponent,
  ComponentDefinition,
} from "./components/base/BaseInterfaceComponent"

interface RenderInterfaceComponentProps {
  Component: typeof BaseInterfaceComponent
  componentDefinition: ComponentDefinition
  data: UserInterfaceProps["data"]
  dragDropDisabled?: boolean
  index: number
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema?: (newComponentDefinition: ComponentDefinition) => void
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
    const {
      Component,
      componentDefinition,
      data,
      dragDropDisabled,
      index,
      mode,
      onChangeData,
      onChangeSchema,
      path,
    } = this.props
    const { error } = this.state

    const shouldBeHidden =
      componentDefinition.hidden ||
      (componentDefinition.visibilityConditions &&
        !jsonLogic.apply(componentDefinition.visibilityConditions, data))

    if (shouldBeHidden) {
      return null
    }

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
        userInterfaceData={data}
        mode={mode}
        onChangeData={(props: UserInterfaceProps["data"]) => {
          console.log("RenderInterfaceComponent.onChangeData", props, onChangeData)
          onChangeData && onChangeData(props)
        }}
        onChangeSchema={(newComponentDefinition: ComponentDefinition) => {
          console.log(
            "RenderInterfaceComponent.onChangeSchema",
            newComponentDefinition,
            onChangeSchema
          )
          onChangeSchema && onChangeSchema(newComponentDefinition)
        }}
        userInterfaceSchema={componentDefinition}
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
            colon={false}
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

    return mode === "edit" && !dragDropDisabled ? (
      <Draggable
        data={componentDefinition}
        draggableId={path}
        editable
        index={index}
        title={layoutDefintion && layoutDefintion.title}
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
