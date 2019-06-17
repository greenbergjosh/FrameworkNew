import { Tabs } from "antd"
import React from "react"
import { ComponentRenderer } from "../ComponentRenderer"
import { ComponentDefinition, LayoutDefinition } from "../components/base/BaseInterfaceComponent"

export interface ManageComponentFormProps {
  componentDefintion: ComponentDefinition
  manageForm: ComponentDefinition | ComponentDefinition[]
  layoutDefinition: LayoutDefinition
}

export const ManageComponentForm = ({ manageForm }: ManageComponentFormProps) => {
  return <ComponentRenderer components={Array.isArray(manageForm) ? manageForm : [manageForm]} />
}
