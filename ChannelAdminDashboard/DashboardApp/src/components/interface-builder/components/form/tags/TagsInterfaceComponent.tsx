import React from "react"
import {
  modes,
  SelectInterfaceComponentProps,
  SelectInterfaceComponent as SharedSelectInterfaceComponent
} from "../_shared/select"
import { tagsManageForm } from "./tags-manage-form"


export class TagsInterfaceComponent extends SharedSelectInterfaceComponent {
  static manageForm = tagsManageForm

  constructor(props: SelectInterfaceComponentProps) {
    super(props, modes.tags)
  }

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
}
