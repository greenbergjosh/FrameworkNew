import { Alert, Form, Icon, Tooltip } from "antd"
import jsonLogic from "json-logic-js"
import React from "react"
import { tryCatch } from "./lib/Option"
import { Draggable } from "./dnd"
import { UserInterfaceProps } from "./UserInterface"
import { BaseInterfaceComponent, ComponentDefinition } from "./components/base/BaseInterfaceComponent"
import { RootUserInterfaceDataContext } from "./util/RootUserInterfaceDataContext"

interface RenderInterfaceComponentProps {
  Component: typeof BaseInterfaceComponent
  componentDefinition: ComponentDefinition
  data: UserInterfaceProps["data"]
  dragDropDisabled?: boolean
  index: number
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema?: (newComponentDefinition: ComponentDefinition) => void
  submit?: UserInterfaceProps["submit"]
  path: string
}

interface RenderInterfaceComponentState {
  error: null | string
}

enum VISIBILITY_MODES {
  normal,
  disabled,
  blocked,
  invisible,
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
      submit,
      path,
    } = this.props
    const { error } = this.state

    const disabledViaJsonLogicVisibilityConditions =
      componentDefinition.visibilityConditions &&
      !tryCatch(() => jsonLogic.apply(componentDefinition.visibilityConditions, data)).foldL(
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

    if ((componentDefinition.hidden || disabledViaJsonLogicVisibilityConditions) && mode !== "edit") {
      return null
    }

    if (error) {
      return (
        <Alert
          message="Component Error"
          description={`An error occurred while rendering the component: ${componentDefinition.component}`}
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

    const layoutDefintion = Component && Component.getLayoutDefinition && Component.getLayoutDefinition()

    const content = Component ? (
      <RootUserInterfaceDataContext.Consumer>
        {(rootData) => (
          <Component
            {...componentDefinition}
            userInterfaceData={data}
            rootUserInterfaceData={rootData}
            mode={mode}
            onChangeData={(props: UserInterfaceProps["data"]) => {
              console.log("RenderInterfaceComponent.onChangeData", props, onChangeData)
              onChangeData && onChangeData(props)
            }}
            onChangeSchema={(newComponentDefinition: ComponentDefinition) => {
              console.log("RenderInterfaceComponent.onChangeSchema", newComponentDefinition, onChangeSchema)
              onChangeSchema && onChangeSchema(newComponentDefinition)
            }}
            submit={submit}
            userInterfaceSchema={componentDefinition}
          />
        )}
      </RootUserInterfaceDataContext.Consumer>
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

    function getInvisibleComponent(visibilityMode: VISIBILITY_MODES, componentTitle?: string) {
      let color, backgroundColor, border, modeTitle
      switch (visibilityMode) {
        case VISIBILITY_MODES.disabled:
          color = "#C70039" // Red
          backgroundColor = "rgba(199, 0, 57, .03)"
          border = " 1px dashed rgba(199, 0, 57, .4)"
          modeTitle = "Disabled"
          break
        case VISIBILITY_MODES.invisible:
          color = "#00B2FF" // Blue
          backgroundColor = "rgba(0, 178, 255, .05)"
          border = " 1px dashed rgba(0, 178, 255, .5)"
          modeTitle = "Invisible"
          break
        case VISIBILITY_MODES.blocked:
          color = "#b6b6b6" // Grey
          backgroundColor = "rgba(182, 182, 182, .05)"
          border = " 1px dashed rgba(182, 182, 182, .5)"
          modeTitle = "Blocked by Visibility Conditions"
          break
      }
      return mode === "edit" ? (
        <fieldset
          style={{
            padding: 10,
            border,
            backgroundColor,
            borderRadius: 5,
            position: "relative",
          }}>
          <legend style={{ all: "unset", color, padding: 5 }}>
            {modeTitle} <small>({componentTitle})</small>
          </legend>
          <div style={{ opacity: 0.5, pointerEvents: "none" }}>{wrapper}</div>
        </fieldset>
      ) : (
        <div style={{ display: "none" }}>{wrapper}</div>
      )
    }

    function getVisibilityToggledComponent(componentTitle?: string) {
      if (componentDefinition.invisible) {
        return getInvisibleComponent(VISIBILITY_MODES.invisible, componentTitle)
      }
      if (componentDefinition.hidden) {
        return getInvisibleComponent(VISIBILITY_MODES.disabled, componentTitle)
      }
      if (disabledViaJsonLogicVisibilityConditions) {
        return getInvisibleComponent(VISIBILITY_MODES.blocked, componentTitle)
      }
      return wrapper
    }

    return mode === "edit" && !dragDropDisabled ? (
      <Draggable
        data={componentDefinition}
        draggableId={path}
        editable
        index={index}
        title={layoutDefintion && layoutDefintion.title}
        type="INTERFACE_COMPONENT">
        {({ isDragging }) => {
          return getVisibilityToggledComponent(layoutDefintion && layoutDefintion.title)
        }}
      </Draggable>
    ) : (
      getVisibilityToggledComponent()
    )
  }
}
const DebugComponent = (props: any) => (
  <Alert closable={false} message={<pre>{JSON.stringify(props, null, 2)}</pre>} type="warning" />
)
