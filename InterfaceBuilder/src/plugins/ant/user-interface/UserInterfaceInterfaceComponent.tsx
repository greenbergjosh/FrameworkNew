import React from "react"
import { UserInterface } from "../../../components/UserInterface/UserInterface"
import { userInterfaceManageForm } from "./user-interface-manage-form"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  LayoutDefinition,
  UserInterfaceProps,
} from "../../../globalTypes"
import { Tooltip } from "antd"

export interface UserInterfaceInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "user-interface"
  defaultDataValue?: any
  defaultValue?: any[]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: UserInterfaceProps["data"]
  valueKey: string
  submit: UserInterfaceProps["submit"]
  hideMenu: boolean
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
    hideMenu: false,
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

  handleChangeData = (data: UserInterfaceProps["data"]): void => {
    this.setState({ data })
  }

  handleChangeSchema = (schema: ComponentDefinition[]) => {
    this.setValue([this.props.valueKey, schema])
  }

  render(): JSX.Element {
    const { defaultValue, valueKey, submit } = this.props
    const { data } = this.state
    if (this.props.mode === "edit") {
      return (
        <Tooltip title="User Interface may not be used in edit mode." trigger="click">
          <div>
            <div style={{ pointerEvents: "none" }}>
              <UserInterface
                components={this.getValue(valueKey) || defaultValue}
                data={data}
                mode="edit"
                onChangeData={this.handleChangeData}
                onChangeSchema={this.handleChangeSchema}
                submit={submit}
                getRootUserInterfaceData={this.props.getRootUserInterfaceData}
                onChangeRootData={this.props.onChangeRootData}
                hideMenu={this.props.hideMenu}
                title={this.props.label}
              />
            </div>
          </div>
        </Tooltip>
      )
    }
    return (
      <UserInterface
        components={this.getValue(valueKey) || defaultValue}
        data={data}
        mode="edit"
        onChangeData={this.handleChangeData}
        onChangeSchema={this.handleChangeSchema}
        submit={submit}
        getRootUserInterfaceData={this.props.getRootUserInterfaceData}
        onChangeRootData={this.props.onChangeRootData}
        hideMenu={this.props.hideMenu}
        title={this.props.label}
      />
    )
  }
}
