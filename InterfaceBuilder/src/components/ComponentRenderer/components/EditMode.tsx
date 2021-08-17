import React from "react"
import { DataBinding } from "../../../components/ComponentModifiers/DataBinding"
import { DraggableWrapper } from "../../../components/ComponentModifiers/DraggableWrapper"
import { EditPanelWrapper } from "../../../components/ComponentModifiers/EditPanelWrapper"
import { EditDataBinding } from "../../../components/ComponentModifiers/EditDataBinding/EditDataBinding"
import { FormField } from "../../../components/ComponentModifiers/FormField"
import { ReplaceTokens } from "../../../components/ComponentModifiers/ReplaceTokens/ReplaceTokens"
import { EditModeProps } from "../../../components/ComponentRenderer"

export function EditMode(props: EditModeProps): JSX.Element {
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
                  hidden={tokenReplacedComponentDefinition.hidden}
                  index={props.index}
                  invisible={tokenReplacedComponentDefinition.invisible}
                  isDragging={isDragging}
                  title={props.layoutDefinition.title}
                  userInterfaceData={props.userInterfaceData}>
                  <FormField
                    componentDefinition={tokenReplacedComponentDefinition}
                    layoutDefinition={props.layoutDefinition}>
                    <EditDataBinding
                      componentDefinition={tokenReplacedComponentDefinition}
                      mode={props.mode}
                      onChangeData={props.onChangeData}
                      onChangeSchema={props.onChangeSchema}
                      userInterfaceData={props.userInterfaceData}>
                      <props.Component
                        {...tokenReplacedComponentDefinition}
                        userInterfaceData={props.userInterfaceData}
                        getRootUserInterfaceData={props.getRootUserInterfaceData}
                        onChangeRootData={props.onChangeRootData}
                        mode={props.mode}
                        onChangeData={props.onChangeData}
                        onChangeSchema={props.onChangeSchema}
                        submit={props.submit}
                        userInterfaceSchema={tokenReplacedComponentDefinition}
                      />
                    </EditDataBinding>
                  </FormField>
                </EditPanelWrapper>
              )}
            </DraggableWrapper>
          )}
        </ReplaceTokens>
      )}
    </DataBinding>
  )
}
