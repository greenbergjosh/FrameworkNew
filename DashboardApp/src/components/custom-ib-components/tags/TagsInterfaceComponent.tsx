import React from "react"
import { SelectInterfaceComponent } from "../select/SelectInterfaceComponent"
import { tagsManageForm } from "./tags-manage-form"
import { MODES } from "../_shared/selectable/types"
import { LayoutDefinition } from "@opg/interface-builder"

export class TagsInterfaceComponent extends SelectInterfaceComponent {
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

  static getLayoutDefinition(): LayoutDefinition {
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
