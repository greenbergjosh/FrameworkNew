import React from "react"
import { ComponentRenderer } from "components/ComponentRenderer"
import { ComponentDefinition, LayoutDefinition, UserInterfaceProps } from "../../../globalTypes"

export interface ManageComponentFormProps {
  componentDefinition: ComponentDefinition
  manageForm: ComponentDefinition | ComponentDefinition[]
  onChangeDefinition: (componentDefinition: ComponentDefinition) => void
  layoutDefinition: LayoutDefinition
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  setRootUserInterfaceData: UserInterfaceProps["setRootUserInterfaceData"]
}

export const Settings = ({
  componentDefinition,
  manageForm,
  onChangeDefinition,
  getRootUserInterfaceData,
  setRootUserInterfaceData,
}: ManageComponentFormProps) => {
  return (
    <ComponentRenderer
      components={Array.isArray(manageForm) ? manageForm : [manageForm]}
      data={componentDefinition}
      getRootData={getRootUserInterfaceData}
      setRootData={setRootUserInterfaceData}
      onChangeData={onChangeDefinition}
      onChangeSchema={(newSchema: any) => {
        console.warn(
          "ManageComponentForm.render",
          "TODO: Cannot alter schema inside ComponentRenderer in ManageComponentForm",
          { newSchema }
        )
      }}
    />
  )
}
