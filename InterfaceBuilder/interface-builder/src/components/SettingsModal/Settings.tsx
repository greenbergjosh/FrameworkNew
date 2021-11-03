import React from "react"
import { ComponentRenderer } from "../../components/ComponentRenderer"
import { ComponentDefinition, LayoutDefinition, UserInterfaceProps } from "../../globalTypes"

export interface ManageComponentFormProps {
  componentDefinition: ComponentDefinition
  manageForm: ComponentDefinition | ComponentDefinition[]
  onChangeDefinition: (componentDefinition: ComponentDefinition) => void
  layoutDefinition: LayoutDefinition
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
}

export const Settings = ({
  componentDefinition,
  manageForm,
  onChangeDefinition,
  getRootUserInterfaceData,
  onChangeRootData,
}: ManageComponentFormProps) => {
  return (
    <ComponentRenderer
      components={Array.isArray(manageForm) ? manageForm : [manageForm]}
      getComponents={() => (Array.isArray(manageForm) ? manageForm : [manageForm])}
      data={componentDefinition}
      getRootUserInterfaceData={getRootUserInterfaceData}
      onChangeRootData={onChangeRootData}
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
