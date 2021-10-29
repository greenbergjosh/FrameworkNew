import React from "react"
import { RenderComponents } from "../../RenderComponents"
import { ManageComponentFormProps } from "components/UserInterface/types"

export const Settings = ({
  componentDefinition,
  manageForm,
  onChangeDefinition,
  getRootUserInterfaceData,
  onChangeRootData,
}: ManageComponentFormProps) => {
  return (
    <RenderComponents
      components={Array.isArray(manageForm) ? manageForm : [manageForm]}
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
