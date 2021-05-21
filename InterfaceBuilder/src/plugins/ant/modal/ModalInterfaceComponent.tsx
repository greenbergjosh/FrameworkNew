import React from "react"
import { BaseInterfaceComponent } from "../../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { modalManageForm } from "./modal-manage-form"
import { LayoutDefinition } from "../../../globalTypes"
import { ModalInterfaceComponentProps } from "./types"
import { DisplayMode } from "plugins/ant/modal/components/DisplayMode"
import { EditMode } from "plugins/ant/modal/components/EditMode"

export class ModalInterfaceComponent extends BaseInterfaceComponent<ModalInterfaceComponentProps> {
  static defaultProps = {
    userInterfaceData: {},
    valueKey: "data",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return {
      category: "Display",
      name: "modal",
      title: "Modal",
      icon: "select",
      componentDefinition: {
        component: "modal",
        components: [],
      },
    }
  }

  static manageForm = modalManageForm

  render(): JSX.Element {
    if (this.props.mode === "edit") {
      return (
        <EditMode
          components={this.props.components}
          footer={this.props.footer}
          getRootUserInterfaceData={this.props.getRootUserInterfaceData}
          setRootUserInterfaceData={this.props.setRootUserInterfaceData}
          mode={this.props.mode}
          onChangeData={this.props.onChangeData}
          onChangeSchema={this.props.onChangeSchema}
          title={this.props.title}
          userInterfaceData={this.props.userInterfaceData}
          userInterfaceSchema={this.props.userInterfaceSchema}
        />
      )
    }
    return (
      <DisplayMode
        components={this.props.components}
        footer={this.props.footer}
        getRootUserInterfaceData={this.props.getRootUserInterfaceData}
        setRootUserInterfaceData={this.props.setRootUserInterfaceData}
        getValue={this.getValue.bind(this)}
        mode={this.props.mode}
        onChangeData={this.props.onChangeData}
        onChangeSchema={() => void 0}
        setValue={this.setValue.bind(this)}
        showKey={this.props.showKey}
        title={this.props.title}
        userInterfaceData={this.props.userInterfaceData}
        userInterfaceSchema={this.props.userInterfaceSchema}
        valueKey={this.props.valueKey}
      />
    )
  }
}
