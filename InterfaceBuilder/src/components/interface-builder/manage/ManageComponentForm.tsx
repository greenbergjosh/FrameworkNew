import React from "react"
import { ComponentRenderer } from "../ComponentRenderer"
import { ComponentDefinition, LayoutDefinition } from "../components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

export interface ManageComponentFormProps {
  componentDefinition: ComponentDefinition
  manageForm: ComponentDefinition | ComponentDefinition[]
  onChangeDefinition: (componentDefinition: ComponentDefinition) => void
  layoutDefinition: LayoutDefinition
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
}

export const ManageComponentForm = ({
  componentDefinition,
  manageForm,
  onChangeDefinition,
  getRootUserInterfaceData,
}: ManageComponentFormProps) => {
  return (
    <ComponentRenderer
      components={Array.isArray(manageForm) ? manageForm : [manageForm]}
      data={componentDefinition}
      getRootData={getRootUserInterfaceData}
      onChangeData={onChangeDefinition}
      onChangeSchema={(newSchema) => {
        console.warn(
          "ManageComponentForm.render",
          "TODO: Cannot alter schema inside ComponentRenderer in ManageComponentForm",
          { newSchema }
        )
      }}
    />
  )
}
