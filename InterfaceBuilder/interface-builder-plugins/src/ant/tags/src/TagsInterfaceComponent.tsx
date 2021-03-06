import React from "react"
import { LayoutDefinition } from "@opg/interface-builder"
import { MODES } from "@opg/interface-builder-plugins/lib/ant/shared"
import SelectInterfaceComponent from "@opg/interface-builder-plugins/lib/ant/select/SelectInterfaceComponent"
import { settings } from "./settings"
import { TagsProps } from "./types"
import layoutDefinition from "./layoutDefinition"

export default class TagsInterfaceComponent extends SelectInterfaceComponent {
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

  static manageForm = settings

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  protected get mode() {
    return MODES.tags
  }
}
