import React from "react"
import { SelectInterfaceComponent } from "../select/SelectInterfaceComponent"
import { tagsManageForm } from "./tags-manage-form"
import { TagsProps } from "./types"
import { MODES } from "../../_shared/selectable/types"

export class TagsInterfaceComponent extends SelectInterfaceComponent {
  constructor(props: TagsProps) {
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
