import React from "react"
import SelectInterfaceComponent from "../select/SelectInterfaceComponent"
import { tagsManageForm } from "./tags-manage-form"
import { MODES } from "../_shared/selectable/types"
import { LayoutDefinition } from "@opg/interface-builder"
import layoutDefinition from "@opg/interface-builder-plugins/lib/ant/tags/layoutDefinition"

export default class TagsInterfaceComponent extends SelectInterfaceComponent {
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
    return layoutDefinition
  }

  protected get mode() {
    return MODES.tags
  }
}
