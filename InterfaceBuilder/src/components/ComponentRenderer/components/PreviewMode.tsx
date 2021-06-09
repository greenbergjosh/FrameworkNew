import React from "react"
import { DataBinding } from "components/ComponentModifiers/DataBinding"
import { FormField } from "components/ComponentModifiers/FormField"
import { DisplayVisibility } from "../../ComponentModifiers/DisplayVisibility"
import { ReplaceTokens } from "components/ComponentModifiers/ReplaceTokens/ReplaceTokens"
import { PreviewModeProps } from "components/ComponentRenderer"

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
