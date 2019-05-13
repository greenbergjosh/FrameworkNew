import React from "react"
import ReactFormBase from "../ReactFormBase"
import editForm from "./select.form"

interface SelectOptions {}

export default class SelectFormComponent extends ReactFormBase<SelectOptions> {
  static schema(...extend: any[]) {
    return ReactFormBase.schema(
      {
        type: "select",
        label: "Select",
        key: "select",
      },
      ...extend
    )
  }

  static builderInfo = {
    title: "Select",
    group: "basic",
    icon: "fa fa-th-list",
    weight: 70,
    schema: SelectFormComponent.schema(),
  }

  static editForm = editForm

  constructor(component: any, options: any, data: any) {
    super(component, options, data)

    this.state = {}
  }

  render(): JSX.Element {
    return <span>This is a SelectFormComponent</span>
  }

  get emptyValue() {
    return {}
  }

  get defaultSchema() {
    return SelectFormComponent.schema()
  }
}
