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
import { ReplaceTokens } from "components/ComponentModifiers/ReplaceTokens/ReplaceTokens"

interface PreviewModeProps {
  componentDefinition:
    | ComponentDefinitionNamedProps
    | (ComponentDefinitionNamedProps & ComponentDefinitionRecursiveProp)
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: ((newComponentDefinition: ComponentDefinition) => void) | undefined
  userInterfaceData: UserInterfaceProps["data"]
  layoutDefinition: LayoutDefinition
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
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
        <ReplaceTokens
          componentDefinition={boundComponentDefinition}
          onChangeData={props.onChangeData}
          onChangeSchema={props.onChangeSchema}
          userInterfaceData={props.userInterfaceData}
          getRootUserInterfaceData={props.getRootUserInterfaceData}
          mode={props.mode}>
          {({ tokenReplacedComponentDefinition }) => (
            <DisplayVisibility
              componentDefinition={tokenReplacedComponentDefinition}
              layoutDefinition={props.layoutDefinition}
              mode={props.mode}
              userInterfaceData={props.userInterfaceData}>
              <FormField componentDefinition={tokenReplacedComponentDefinition} layoutDefinition={props.layoutDefinition}>
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
              </FormField>
            </DisplayVisibility>
          )}
        </ReplaceTokens>
      )}
    </DataBinding>
  )
}
