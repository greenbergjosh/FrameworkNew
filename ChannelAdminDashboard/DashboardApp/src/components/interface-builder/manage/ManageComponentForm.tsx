import React from "react"
import { ComponentRenderer } from "../ComponentRenderer"
import { ComponentDefinition, LayoutDefinition } from "../components/base/BaseInterfaceComponent"

export interface ManageComponentFormProps {
  componentDefinition: ComponentDefinition
  manageForm: ComponentDefinition | ComponentDefinition[]
  onChangeDefinition: (componentDefinition: ComponentDefinition) => void
  layoutDefinition: LayoutDefinition
}

export const ManageComponentForm = ({
  componentDefinition,
  manageForm,
  onChangeDefinition,
}: ManageComponentFormProps) => {
  return (
    <ComponentRenderer
      components={Array.isArray(manageForm) ? manageForm : [manageForm]}
      onChangeData={onChangeDefinition}
      data={componentDefinition}
    />
  )
}
