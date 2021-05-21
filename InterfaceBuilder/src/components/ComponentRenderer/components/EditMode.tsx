import React from "react"
import { DataBinding } from "components/ComponentModifiers/DataBinding"
import { DraggableWrapper } from "components/ComponentModifiers/DraggableWrapper"
import { EditPanelWrapper } from "components/ComponentModifiers/EditPanelWrapper"
import { EditDataBinding } from "components/ComponentModifiers/EditDataBinding/EditDataBinding"
import { FormField } from "components/ComponentModifiers/FormField"
import { BaseInterfaceComponent } from "components/BaseInterfaceComponent/BaseInterfaceComponent"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentDefinitionRecursiveProp,
  LayoutDefinition,
  UserInterfaceProps,
} from "../../../globalTypes"

interface ModeProps {
  componentDefinition:
    | ComponentDefinitionNamedProps
    | (ComponentDefinitionNamedProps & ComponentDefinitionRecursiveProp)
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: ((newComponentDefinition: ComponentDefinition) => void) | undefined
  userInterfaceData: UserInterfaceProps["data"]
  layoutDefinition: LayoutDefinition
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"]
  mode: UserInterfaceProps["mode"]
  submit: (() => void) | undefined
  Component: typeof BaseInterfaceComponent
}

interface EditModeProps extends ModeProps {
  dragDropDisabled: boolean | undefined
  index: number
  path: string
}

export function EditMode(props: EditModeProps): JSX.Element {
  return (
    <DataBinding
      componentDefinition={props.componentDefinition}
      onChangeData={props.onChangeData}
      onChangeSchema={props.onChangeSchema}
      userInterfaceData={props.userInterfaceData}
      getRootUserInterfaceData={props.getRootUserInterfaceData}>
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
              hidden={boundComponentDefinition.hidden}
              index={props.index}
              invisible={boundComponentDefinition.invisible}
              isDragging={isDragging}
              title={props.layoutDefinition.title}
              userInterfaceData={props.userInterfaceData}>
              <FormField componentDefinition={boundComponentDefinition} layoutDefinition={props.layoutDefinition}>
                <EditDataBinding
                  componentDefinition={boundComponentDefinition}
                  mode={props.mode}
                  onChangeData={props.onChangeData}
                  onChangeSchema={props.onChangeSchema}
                  userInterfaceData={props.userInterfaceData}>
                  <props.Component
                    {...boundComponentDefinition}
                    userInterfaceData={props.userInterfaceData}
                    getRootUserInterfaceData={props.getRootUserInterfaceData}
                    setRootUserInterfaceData={props.setRootUserInterfaceData}
                    mode={props.mode}
                    onChangeData={props.onChangeData}
                    onChangeSchema={props.onChangeSchema}
                    submit={props.submit}
                    userInterfaceSchema={boundComponentDefinition}
                  />
                </EditDataBinding>
              </FormField>
            </EditPanelWrapper>
          )}
        </DraggableWrapper>
      )}
    </DataBinding>
  )
}
