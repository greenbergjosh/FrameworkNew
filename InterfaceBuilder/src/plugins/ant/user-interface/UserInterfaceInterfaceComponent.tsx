import { get, set } from "lodash/fp"
import React from "react"
import { UserInterface } from "components/UserInterface/UserInterface"
import { userInterfaceManageForm } from "./user-interface-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  UserInterfaceProps,
} from "../../../globalTypes"

export interface UserInterfaceInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "user-interface"
  defaultDataValue?: any
  defaultValue?: any[]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  valueKey: string
  submit: UserInterfaceProps["submit"]
}

interface UserInterfaceInterfaceComponentState {
  data: any
}

export class UserInterfaceInterfaceComponent extends BaseInterfaceComponent<
  UserInterfaceInterfaceComponentProps,
  UserInterfaceInterfaceComponentState
> {
  static defaultProps = {
    defaultDataValue: {},
    defaultValue: [],
    mode: "edit",
    valueKey: "layout",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Special",
      name: "user-interface",
      title: "User Interface",
      icon: "build",
      componentDefinition: {
        component: "user-interface",
        label: "User Interface",
      },
    }
  }

  static manageForm = userInterfaceManageForm

  constructor(props: UserInterfaceInterfaceComponentProps) {
    super(props)
    this.state = { data: props.defaultDataValue }
  }

  handleChangeData = (data: any): void => {
    this.setState({ data })
  }

  handleChangeSchema = (schema: ComponentDefinition[]) => {
    const { onChangeData, userInterfaceData, valueKey } = this.props
    // console.log("UserInterfaceInterfaceComponent.onChangeSchema", schema, onChangeData)
    onChangeData && onChangeData(set(valueKey, schema, userInterfaceData))
  }

  render(): JSX.Element {
    const { defaultValue, /*mode,*/ userInterfaceData, valueKey, submit } = this.props
    const { data } = this.state
    return (
      <UserInterface
        components={get(valueKey, userInterfaceData) || defaultValue}
        data={data}
        mode="edit"
        onChangeData={this.handleChangeData}
        onChangeSchema={this.handleChangeSchema}
        submit={submit}
        getRootUserInterfaceData={this.props.getRootUserInterfaceData}
      />
    )
  }
}
