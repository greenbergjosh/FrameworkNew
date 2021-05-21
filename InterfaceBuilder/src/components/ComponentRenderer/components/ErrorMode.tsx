import { Alert, Collapse, Icon } from "antd"
import React from "react"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentDefinitionRecursiveProp,
  LayoutDefinition,
  UserInterfaceProps,
} from "../../../globalTypes"
import { EditPanelWrapper } from "components/ComponentModifiers/EditPanelWrapper"
import { BaseInterfaceComponent } from "components/BaseInterfaceComponent/BaseInterfaceComponent"
import { DraggableWrapper } from "components/ComponentModifiers/DraggableWrapper"
import { DataBinding } from "components/ComponentModifiers/DataBinding"

interface ModeProps {
  componentDefinition:
    | ComponentDefinitionNamedProps
    | (ComponentDefinitionNamedProps & ComponentDefinitionRecursiveProp)
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: ((newComponentDefinition: ComponentDefinition) => void) | undefined
  userInterfaceData: UserInterfaceProps["data"]
  layoutDefinition: LayoutDefinition
  rootUserInterfaceData: () => UserInterfaceProps["data"]
  mode: UserInterfaceProps["mode"]
  submit: (() => void) | undefined
  Component: typeof BaseInterfaceComponent
}

interface ErrorModeProps extends ModeProps {
  dragDropDisabled: boolean | undefined
  index: number
  path: string
  error: string | null
}

export function ErrorMode(props: ErrorModeProps): JSX.Element {
  if (!props.Component) {
    console.error(`Missing Component ${props.componentDefinition.component}`, {
      componentDefinition: props.componentDefinition,
      index: props.index,
      mode: props.mode,
    })
  }

  if (props.mode !== "edit") {
    return (
      <Alert
        message="Component Error"
        description={`An error occurred while rendering the "${props.componentDefinition.component}" component.`}
        type="error"
      />
    )
  }

  return (
    <DataBinding
      componentDefinition={props.componentDefinition}
      onChangeData={props.onChangeData}
      onChangeSchema={props.onChangeSchema}
      userInterfaceData={props.userInterfaceData}>
      {({ boundComponentDefinition }) => (
        <DraggableWrapper
          componentDefinition={boundComponentDefinition}
          dragDropDisabled={props.dragDropDisabled}
          index={props.index}
          layoutDefinition={props.layoutDefinition}
          mode={props.mode}
          path={props.path}>
          {({ isDragging, draggableItem }) => (
            <EditPanelWrapper
              componentDefinition={boundComponentDefinition}
              draggableItem={draggableItem}
              hasError={true}
              hidden={boundComponentDefinition.hidden}
              index={props.index}
              invisible={boundComponentDefinition.invisible}
              isDragging={isDragging}
              title={boundComponentDefinition.component}
              userInterfaceData={props.userInterfaceData}>
              <div
                style={{
                  margin: 10,
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  justifyContent: "flex-start",
                  alignContent: "stretch",
                  alignItems: "flex-start",
                }}>
                <Icon
                  type="warning"
                  style={{
                    order: 0,
                    flex: "0 1 auto",
                    alignSelf: "auto",
                    fontSize: "1.5em",
                    marginRight: 10,
                    color: "#c70039",
                  }}
                />
                <div
                  style={{
                    order: 0,
                    flex: "1 1 auto",
                    alignSelf: "auto",
                    color: "#c70039",
                  }}>
                  <h3 style={{ color: "#c70039" }}>Component Error</h3>
                  <p>{props.error}</p>
                  <Collapse>
                    <Collapse.Panel header="Diagnostics" key="2">
                      <div style={{ overflow: "scroll", width: "50vw" }}>
                        <pre>{JSON.stringify(props, null, 2)}</pre>
                      </div>
                    </Collapse.Panel>
                  </Collapse>
                </div>
              </div>
            </EditPanelWrapper>
          )}
        </DraggableWrapper>
      )}
    </DataBinding>
  )
}
