import React from "react"
import { BaseInterfaceComponent, StringTemplate, UserInterfaceContext, utils } from "@opg/interface-builder"
import { stringTemplateManageForm } from "./string-template-manage-form"
import { StringTemplateInterfaceComponentProps, StringTemplateInterfaceComponentState } from "./types"
import { loadRemoteLBM } from "../_shared/LBM/loadRemoteLBM"
import { AdminUserInterfaceContextManager } from "../../../data/AdminUserInterfaceContextManager.type"

export class StringTemplateInterfaceComponent extends BaseInterfaceComponent<
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  StringTemplateInterfaceComponentProps,
  StringTemplateInterfaceComponentState
> {
  constructor(props: StringTemplateInterfaceComponentProps) {
    super(props)

    this.state = {
      serialize: () => undefined,
      deserialize: () => undefined,
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
        "Query cannot load any data without a UserInterfaceContext in the React hierarchy"
      )
      return
    }
    const { loadById } = this.context as AdminUserInterfaceContextManager
    const serializeSrc = loadRemoteLBM(loadById, this.props.serializeConfigId)
    const deserializeSrc = loadRemoteLBM(loadById, this.props.deserializeConfigId)
    const serialize = utils.parseLBM<StringTemplate.SerializeType>(serializeSrc)
    const deserialize = utils.parseLBM<StringTemplate.DeserializeType>(deserializeSrc)

    serialize && this.setState({ serialize })
    deserialize && this.setState({ deserialize })
  }

  render() {
    return (
      <StringTemplate.StringTemplateInterfaceComponent
        {...this.props}
        serialize={this.state.serialize}
        deserialize={this.state.deserialize}
      />
    )
  }
}
