import { Alert, Collapse, Icon } from "antd"
import React from "react"
import { EditPanelWrapper } from "../../../components/ComponentModifiers/EditPanelWrapper"
import { DraggableWrapper } from "../../../components/ComponentModifiers/DraggableWrapper"
import { DataBinding } from "../../../components/ComponentModifiers/DataBinding"
import { ReplaceTokens } from "../../../components/ComponentModifiers/ReplaceTokens/ReplaceTokens"
import { ErrorModeProps } from "../types"

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
      userInterfaceData={props.userInterfaceData}
      getRootUserInterfaceData={props.getRootUserInterfaceData}>
      {({ boundComponentDefinition }) => (
        <ReplaceTokens
          componentDefinition={boundComponentDefinition}
          onChangeData={props.onChangeData}
          onChangeSchema={props.onChangeSchema}
          userInterfaceData={props.userInterfaceData}
          getRootUserInterfaceData={props.getRootUserInterfaceData}
          mode={props.mode}>
          {({ tokenReplacedComponentDefinition }) => (
            <DraggableWrapper
              componentDefinition={tokenReplacedComponentDefinition}
              dragDropDisabled={props.dragDropDisabled}
              index={props.index}
              layoutDefinition={props.layoutDefinition}
              mode={props.mode}
              path={props.path}>
              {({ isDragging, draggableItem }) => (
                <EditPanelWrapper
                  component={props.Component}
                  componentDefinition={tokenReplacedComponentDefinition}
                  draggableItem={draggableItem}
                  hasError={true}
                  hidden={tokenReplacedComponentDefinition.hidden}
                  index={props.index}
                  invisible={tokenReplacedComponentDefinition.invisible}
                  isDragging={isDragging}
                  title={tokenReplacedComponentDefinition.component}
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
        </ReplaceTokens>
      )}
    </DataBinding>
  )
}
