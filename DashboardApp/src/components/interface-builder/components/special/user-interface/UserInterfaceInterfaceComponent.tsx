import React from "react"
import { UserInterface, UserInterfaceProps } from "../../../UserInterface"
import { userInterfaceManageForm } from "./user-interface-manage-form"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentDefinition,
} from "../../base/BaseInterfaceComponent"

export interface UserInterfaceInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "user-interface"
  defaultDataValue?: any
  defaultValue?: any[]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
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

  static getLayoutDefinition() {
    return {
      category: "Special",
      name: "user-interface",
      title: "Layout Creator",
      icon: "build",
      componentDefinition: {
        component: "user-interface",
        label: "Layout Creator",
      },
    }
  }

  static manageForm = userInterfaceManageForm

  constructor(props: UserInterfaceInterfaceComponentProps) {
    super(props)
    this.state = { data: props.defaultDataValue }
  }

  handleChangeData = (data: any) => {
    this.setState({ data })
  }

  handleChangeSchema = (schema: ComponentDefinition[]) => {
    const { onChangeData, userInterfaceData, valueKey } = this.props
    console.log("UserInterfaceInterfaceComponent.handleChangeSchema", schema, onChangeData)
    onChangeData && onChangeData({ ...userInterfaceData, [valueKey]: schema })
  }

  render(): JSX.Element {
    const { defaultValue, mode, userInterfaceData, valueKey } = this.props
    const { data } = this.state
    return (
      <UserInterface
        components={userInterfaceData[valueKey] || defaultValue}
        data={data}
        mode="edit"
        onChangeData={this.handleChangeData}
        onChangeSchema={this.handleChangeSchema}
      />
    )
  }
}
