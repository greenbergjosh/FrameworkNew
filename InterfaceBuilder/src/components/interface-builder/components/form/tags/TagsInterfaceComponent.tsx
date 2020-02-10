import React from "react"
import { MODES, SelectInterfaceComponent, SelectProps } from "../select/SelectInterfaceComponent"
import { tagsManageForm } from "./tags-manage-form"


export class TagsInterfaceComponent extends SelectInterfaceComponent {
  constructor(props: SelectProps) {
    super(props)
  }

  static defaultProps = {
    allowClear: true,
    createNewLabel: "Create New...",
    defaultValue: undefined,
    multiple: false,
    placeholder: "Choose",
    valueKey: "value",
    valuePrefix: "",
    valueSuffix: "",
  }

  static manageForm = tagsManageForm

  static getLayoutDefinition() {
    return {
      category: "Form",
      name: "tags",
      title: "Tags",
      icon: "tags",
      formControl: true,
      componentDefinition: {
        component: "tags",
        label: "Tags",
      },
    }
  }

  protected get mode() {
    return MODES.tags
  }
}
