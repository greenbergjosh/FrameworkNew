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

interface PreviewModeProps {
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

export function PreviewMode(props: PreviewModeProps): JSX.Element {
  return (
    <DataBinding
      componentDefinition={props.componentDefinition}
      onChangeData={props.onChangeData}
      onChangeSchema={props.onChangeSchema}
      userInterfaceData={props.userInterfaceData}
      getRootUserInterfaceData={props.getRootUserInterfaceData}>
      {({ boundComponentDefinition }) => (
        <DisplayVisibility
          componentDefinition={boundComponentDefinition}
          layoutDefinition={props.layoutDefinition}
          mode={props.mode}
          userInterfaceData={props.userInterfaceData}>
          <FormField componentDefinition={boundComponentDefinition} layoutDefinition={props.layoutDefinition}>
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
          </FormField>
        </DisplayVisibility>
      )}
    </DataBinding>
  )
}
