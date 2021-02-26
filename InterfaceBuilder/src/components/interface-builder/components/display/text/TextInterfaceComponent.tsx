import React from "react"
import { textManageForm } from "./text-manage-form"
import { BaseInterfaceComponent } from "../../base/BaseInterfaceComponent"
import { TextInterfaceComponentProps, TextInterfaceComponentState } from "./types"
import { Text } from "./components/Text"

export class TextInterfaceComponent extends BaseInterfaceComponent<
  TextInterfaceComponentProps,
  TextInterfaceComponentState
> {
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
    showBorder: true,
  }

  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "text",
      title: "Text",
      icon: "font-size",
      description: `Enter text to display.
        ADVANCED: You can include simple jsonPath expressions like "{$.propertyName}".`,
      componentDefinition: {
        component: "text",
        components: [],
      },
    }
  }

  static manageForm = textManageForm

  render() {
    return <Text {...this.props} data={this.getValue(this.props.valueKey)} />
  }
}
