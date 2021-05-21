import React from "react"
import { DataBinding } from "components/ComponentModifiers/DataBinding"
import { FormField } from "components/ComponentModifiers/FormField"
import { BaseInterfaceComponent } from "components/BaseInterfaceComponent/BaseInterfaceComponent"
import { DisplayVisibility } from "../../ComponentModifiers/DisplayVisibility"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentDefinitionRecursiveProp,
  LayoutDefinition,
  UserInterfaceProps,
} from "../../../globalTypes"
import { EditDataBinding } from "components/ComponentModifiers/EditDataBinding/EditDataBinding"

interface DisplayModeProps {
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

export function DisplayMode(props: DisplayModeProps): JSX.Element {
  return (
    <DataBinding
      componentDefinition={props.componentDefinition}
      onChangeData={props.onChangeData}
      onChangeSchema={props.onChangeSchema}
      userInterfaceData={props.userInterfaceData}>
      {({ boundComponentDefinition }) => (
        <DisplayVisibility
          componentDefinition={boundComponentDefinition}
          layoutDefinition={props.layoutDefinition}
          mode={props.mode}
          userInterfaceData={props.userInterfaceData}>
          <FormField componentDefinition={boundComponentDefinition} layoutDefinition={props.layoutDefinition}>
            {props.componentDefinition.bindable ? (
              <EditDataBinding
                componentDefinition={boundComponentDefinition}
                mode={props.mode}
                onChangeData={props.onChangeData}
                onChangeSchema={props.onChangeSchema}
                userInterfaceData={props.userInterfaceData}>
                <props.Component
                  {...boundComponentDefinition}
                  userInterfaceData={props.userInterfaceData}
                  getRootUserInterfaceData={props.rootUserInterfaceData}
                  mode={props.mode}
                  onChangeData={props.onChangeData}
                  onChangeSchema={props.onChangeSchema}
                  submit={props.submit}
                  userInterfaceSchema={boundComponentDefinition}
                />
              </EditDataBinding>
            ) : (
              <props.Component
                {...boundComponentDefinition}
                userInterfaceData={props.userInterfaceData}
                getRootUserInterfaceData={props.rootUserInterfaceData}
                mode={props.mode}
                onChangeData={props.onChangeData}
                onChangeSchema={props.onChangeSchema}
                submit={props.submit}
                userInterfaceSchema={boundComponentDefinition}
              />
            )}
          </FormField>
        </DisplayVisibility>
      )}
    </DataBinding>
  )
}
