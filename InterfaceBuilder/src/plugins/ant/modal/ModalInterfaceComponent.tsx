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
    valueKey: "modalData",
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
          closable={this.props.closable}
          components={this.props.components}
          destroyOnClose={this.props.destroyOnClose}
          footer={this.props.footer}
          getRootUserInterfaceData={this.props.getRootUserInterfaceData}
          mask={this.props.mask}
          mode={this.props.mode}
          onChangeData={this.props.onChangeData}
          onChangeRootData={this.props.onChangeRootData}
          onChangeSchema={this.props.onChangeSchema}
          title={this.props.title}
          userInterfaceData={this.props.userInterfaceData}
          userInterfaceSchema={this.props.userInterfaceSchema}
        />
      )
    }
    return (
      <DisplayMode
        bodyStyle={this.props.bodyStyle}
        closable={this.props.closable}
        components={this.props.components}
        destroyOnClose={this.props.destroyOnClose}
        footer={this.props.footer}
        getRootUserInterfaceData={this.props.getRootUserInterfaceData}
        getValue={this.getValue.bind(this)}
        mask={this.props.mask}
        maskStyle={this.props.maskStyle}
        modalStyle={this.props.modalStyle}
        mode={this.props.mode}
        onChangeData={this.props.onChangeData}
        onChangeRootData={this.props.onChangeRootData}
        onChangeSchema={() => void 0}
        setValue={this.setValue.bind(this)}
        showKey={this.props.showKey}
        style={this.props.style}
        title={this.props.title}
        userInterfaceData={this.props.userInterfaceData}
        valueKey={this.props.valueKey}
      />
    )
  }
}
