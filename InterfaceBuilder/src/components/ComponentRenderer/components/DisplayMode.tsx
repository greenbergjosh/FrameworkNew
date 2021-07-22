import React from "react"
import { DataBinding } from "components/ComponentModifiers/DataBinding"
import { FormField } from "components/ComponentModifiers/FormField"
import { DisplayVisibility } from "../../ComponentModifiers/DisplayVisibility"
import { EditDataBinding } from "components/ComponentModifiers/EditDataBinding/EditDataBinding"
import { ReplaceTokens } from "components/ComponentModifiers/ReplaceTokens/ReplaceTokens"
import { DisplayModeProps } from "components/ComponentRenderer"

export function DisplayMode(props: DisplayModeProps): JSX.Element {
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
              onVisibilityChange={props.onVisibilityChange}
              userInterfaceData={props.userInterfaceData}>
              <FormField
                componentDefinition={tokenReplacedComponentDefinition}
                layoutDefinition={props.layoutDefinition}>
                {props.componentDefinition.bindable ? (
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
                ) : (
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
                )}
              </FormField>
            </DisplayVisibility>
          )}
        </ReplaceTokens>
      )}
    </DataBinding>
  )
}
