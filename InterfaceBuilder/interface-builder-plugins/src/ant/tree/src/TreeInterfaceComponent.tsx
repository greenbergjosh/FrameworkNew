import "./styles.scss"
import React from "react"
import { BaseInterfaceComponent, LayoutDefinition } from "@opg/interface-builder"
import { DisplayMode } from "./components/DisplayMode"
import { TreeInterfaceComponentProps } from "./types"
import { treeManageForm } from "./tree-manage-form"
import { TreeNodeNormal } from "antd/lib/tree/Tree"
import layoutDefinition from "./layoutDefinition"

export default class TreeInterfaceComponent extends BaseInterfaceComponent<TreeInterfaceComponentProps> {
  static defaultProps = {
    addLabel: "Add Item",
    addLeafLabel: "Add Leaf",
    addParentLabel: "Add Parent",
    emptyText: "No Items",
  }

  static getLayoutDefinition(): LayoutDefinition {
    return layoutDefinition
  }

  static manageForm = treeManageForm

  handleChange = (treeData: TreeNodeNormal[]): void => {
    this.setValue([this.props.valueKey, treeData])
  }

  render(): JSX.Element | undefined {
    const data = this.getValue(this.props.valueKey) || []

    switch (this.props.mode) {
      case "display": {
        return (
          <DisplayMode
            addLabel={this.props.addLabel}
            addLeafLabel={this.props.addLeafLabel}
            addParentLabel={this.props.addParentLabel}
            allowAdd={this.props.allowAdd}
            allowAddLeaves={this.props.allowAddLeaves}
            allowAddParents={this.props.allowAddParents}
            allowDetails={this.props.allowDetails}
            allowNestInLeaves={this.props.allowNestInLeaves}
            allowSelectParents={this.props.allowSelectParents}
            component={this.props.component}
            components={this.props.components}
            data={data}
            detailsOrientation={this.props.detailsOrientation}
            emptyText={this.props.emptyText}
            getRootUserInterfaceData={this.props.getRootUserInterfaceData}
            getValue={this.getValue.bind(this)}
            modifiable={this.props.modifiable}
            onChange={this.handleChange}
            onChangeRootData={this.props.onChangeRootData}
            selectable={this.props.selectable}
            selectedKey={this.props.selectedKey}
            setValue={this.setValue.bind(this)}
            valueKey={this.props.valueKey}
          />
        )
      }
      case "preview": {
        return (
          <DisplayMode
            addLabel={this.props.addLabel}
            addLeafLabel={this.props.addLeafLabel}
            addParentLabel={this.props.addParentLabel}
            allowAdd={this.props.allowAdd}
            allowAddLeaves={this.props.allowAddLeaves}
            allowAddParents={this.props.allowAddParents}
            allowDetails={this.props.allowDetails}
            allowNestInLeaves={this.props.allowNestInLeaves}
            allowSelectParents={this.props.allowSelectParents}
            component={this.props.component}
            components={this.props.components}
            data={data}
            detailsOrientation={this.props.detailsOrientation}
            emptyText={this.props.emptyText}
            getRootUserInterfaceData={this.props.getRootUserInterfaceData}
            getValue={this.getValue.bind(this)}
            modifiable={this.props.modifiable}
            onChange={() => void 0}
            onChangeRootData={() => void 0}
            selectable={this.props.selectable}
            selectedKey={this.props.selectedKey}
            setValue={this.setValue.bind(this)}
            valueKey={this.props.valueKey}
          />
        )
      }
      case "edit": {
        return (
          <DisplayMode
            addLabel={this.props.addLabel}
            addLeafLabel={this.props.addLeafLabel}
            addParentLabel={this.props.addParentLabel}
            allowAdd={this.props.allowAdd}
            allowAddLeaves={this.props.allowAddLeaves}
            allowAddParents={this.props.allowAddParents}
            allowDetails={this.props.allowDetails}
            allowNestInLeaves={this.props.allowNestInLeaves}
            allowSelectParents={this.props.allowSelectParents}
            component={this.props.component}
            components={this.props.components}
            data={data}
            detailsOrientation={this.props.detailsOrientation}
            emptyText={this.props.emptyText}
            getRootUserInterfaceData={this.props.getRootUserInterfaceData}
            getValue={this.getValue.bind(this)}
            modifiable={this.props.modifiable}
            onChange={this.handleChange}
            onChangeRootData={this.props.onChangeRootData}
            selectable={this.props.selectable}
            selectedKey={this.props.selectedKey}
            setValue={this.setValue.bind(this)}
            valueKey={this.props.valueKey}
          />
        )
      }
    }
  }
}
