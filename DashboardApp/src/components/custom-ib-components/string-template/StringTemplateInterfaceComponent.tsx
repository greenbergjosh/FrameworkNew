import React from "react"
import { BaseInterfaceComponent, StringTemplate, UserInterfaceContext } from "@opg/interface-builder"
import { stringTemplateManageForm } from "./string-template-manage-form"
import { StringTemplateInterfaceComponentProps, StringTemplateInterfaceComponentState } from "./types"
import { loadRemoteLBM } from "../../../lib/loadRemoteLBM"
import { AdminUserInterfaceContextManager } from "../../../data/AdminUserInterfaceContextManager.type"

export class StringTemplateInterfaceComponent extends BaseInterfaceComponent<
  StringTemplateInterfaceComponentProps,
  StringTemplateInterfaceComponentState
> {
  constructor(props: StringTemplateInterfaceComponentProps) {
    super(props)

    this.state = {
      serializeSrc: undefined,
      deserializeSrc: undefined,
    }
  }
  context!: React.ContextType<typeof UserInterfaceContext>
  static contextType = UserInterfaceContext
  static defaultProps = StringTemplate.StringTemplateInterfaceComponent.defaultProps
  static getLayoutDefinition = StringTemplate.StringTemplateInterfaceComponent.getLayoutDefinition
  static manageForm = stringTemplateManageForm

  componentDidMount(): void {
    if (!this.context) {
      console.warn(
        "StringTemplateInterfaceComponent",
        "String Template cannot load any data without a UserInterfaceContext in the React hierarchy"
      )
      return
    }
    const { loadById } = this.context as AdminUserInterfaceContextManager
    const serializeSrc = loadRemoteLBM(loadById, this.props.serializeConfigId)
    const deserializeSrc = loadRemoteLBM(loadById, this.props.deserializeConfigId)

    serializeSrc && this.setState({ serializeSrc })
    deserializeSrc && this.setState({ deserializeSrc })
  }

  render() {
    return (
      <StringTemplate.StringTemplateInterfaceComponent
        {...this.props}
        serializeSrc={this.state.serializeSrc}
        deserializeSrc={this.state.deserializeSrc}
      />
    )
  }
}
