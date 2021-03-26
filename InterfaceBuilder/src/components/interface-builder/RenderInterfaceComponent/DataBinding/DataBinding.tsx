import React from "react"
import { ComponentDefinition } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { RenderInterfaceComponentProps } from "../types"
import { EditDataBinding } from "./EditDataBinding"
import { DisplayDataBinding } from "./DisplayDataBinding"
import { isEmpty } from "lodash/fp"

export const DataBinding: React.FC<{
  componentDefinition: ComponentDefinition
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: RenderInterfaceComponentProps["onChangeSchema"]
  userInterfaceData: UserInterfaceProps["data"]
  mode: UserInterfaceProps["mode"]
}> = (props): JSX.Element => {
  if (props.componentDefinition.bindable) {
    return (
      <EditDataBinding
        onChangeData={props.onChangeData}
        userInterfaceData={props.userInterfaceData}
        componentDefinition={props.componentDefinition}
        onChangeSchema={props.onChangeSchema}
        mode={props.mode}>
        {props.children}
      </EditDataBinding>
    )
  }

  if (props.componentDefinition.bindings && !isEmpty(props.componentDefinition.bindings)) {
    return (
      <DisplayDataBinding
        onChangeData={props.onChangeData}
        userInterfaceData={props.userInterfaceData}
        componentDefinition={props.componentDefinition}
        onChangeSchema={props.onChangeSchema}>
        {props.children}
      </DisplayDataBinding>
    )
  }

  return <>{props.children}</>
}
