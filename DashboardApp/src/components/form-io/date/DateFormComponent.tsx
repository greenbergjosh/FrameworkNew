import React from "react"
import ReactFormBase from "../ReactFormBase"
import editForm from "./date.form"

interface DateOptions {}

export default class DateFormComponent extends ReactFormBase<DateOptions> {
  static schema(...extend: any[]) {
    return ReactFormBase.schema(
      {
        type: "date-range",
        label: "Date Range",
      },
      ...extend
    )
  }

  static builderInfo = {
    title: "Date",
    group: "basic",
    icon: "fa fa-calendar",
    weight: 50,
    schema: DateFormComponent.schema(),
  }

  static editForm = editForm

  constructor(component: any, options: any, data: any) {
    super(component, options, data)

    this.state = {}
  }

  render(): JSX.Element {
    return <span>This is a DateFormComponent</span>
  }

  get emptyValue() {
    return {}
  }

  get defaultSchema() {
    return DateFormComponent.schema()
  }
}
