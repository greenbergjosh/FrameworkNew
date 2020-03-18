import {
  Button,
  Col,
  Divider,
  Empty,
  Icon,
  Row,
  Tree
  } from "antd"
import {
  cloneDeep,
  get,
  getOr,
  set
  } from "lodash/fp"
import React from "react"
import { DataPathContext } from "../../../util/DataPathContext"
import { ComponentRenderer } from "../../../ComponentRenderer"
import { UserInterfaceProps } from "../../../UserInterface"
import { ConfirmableDeleteButton } from "./confirmable-delete"
import "./tree.module.scss"
import { treeManageForm } from "./tree-manage-form"
import {
  AntTreeNodeDropEvent,
  AntTreeNodeMouseEvent,
  AntTreeNodeSelectedEvent,
  TreeNodeNormal,
} from "antd/lib/tree/Tree"
import {
  BaseInterfaceComponent,
  ComponentDefinitionNamedProps,
  ComponentDefinition,
} from "../../base/BaseInterfaceComponent"

type EntryType = "standard" | "leaf" | "parent"

export interface TreeInterfaceComponentProps extends ComponentDefinitionNamedProps {
  addLabel: string
  addLeafLabel: string
  addParentLabel: string
  allowAdd?: boolean
  allowAddLeaves?: boolean
  allowAddParents?: boolean
  allowDetails?: boolean
  allowNestInLeaves?: boolean
  allowSelectParents?: boolean
  component: "tree"
  components: ComponentDefinition[]
  detailsOrientation?: "left" | "right" | "below"
  emptyText: string
  modifiable?: boolean
  onChangeData: UserInterfaceProps["onChangeData"]
  selectable?: boolean
  selectedKey?: string
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

export class TreeInterfaceComponent extends BaseInterfaceComponent<TreeInterfaceComponentProps> {
  static defaultProps = {
    addLabel: "Add Item",
    addLeafLabel: "Add Leaf",
    addParentLabel: "Add Parent",
    emptyText: "No Items",
  }

  static getLayoutDefinition() {
    return {
      category: "Display",
      name: "tree",
      title: "Tree",
      icon: "apartment",
      componentDefinition: {
        component: "tree",
      },
    }
  }

  static manageForm = treeManageForm

  addEntry = (type: EntryType) => () => {
    const { onChangeData, userInterfaceData, valueKey } = this.props
    const data = getOr([], valueKey, userInterfaceData) as TreeNodeNormal[]
    const newItem = {
      key: String(Math.random()),
      title: `New ${type} ${Math.round(Math.random() * 100)}`,
    } as TreeNodeNormal
    if (type !== "leaf") {
      newItem.children = []
      newItem.isLeaf = false
    } else {
      newItem.isLeaf = true
    }

    onChangeData && onChangeData(set(valueKey, [...data, newItem], userInterfaceData))
  }

  handleDragOver = (event: AntTreeNodeMouseEvent) => {
    console.log("TreeInterfaceComponent.handleDragOver", event, (event.node as any).isLeaf())
  }

  // Adapated from suggested Ant code at https://ant.design/components/tree/
  handleDrop = (event: AntTreeNodeDropEvent) => {
    const { onChangeData, userInterfaceData, valueKey } = this.props
    const data = cloneDeep(getOr([], valueKey, userInterfaceData) as TreeNodeNormal[])

    const dropKey = event.node.props.eventKey || ""
    const dragKey = event.dragNode.props.eventKey || ""
    const dropPos = event.node.props.pos.split("-")
    const dropPosition = event.dropPosition - Number(dropPos[dropPos.length - 1])

    // Find dragObject
    let dragObj: TreeNodeNormal
    findTreeNode(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })

    if (!event.dropToGap && !(event.node as any).isLeaf()) {
      // Drop on the content
      findTreeNode(data, dropKey, (item) => {
        item.children = item.children || []
        item.children.push(dragObj)
      })
    } else if (
      !(event.node as any).isLeaf() &&
      ((event.node.props.children || []) as TreeNodeNormal[]).length > 0 && // Has children
      event.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      findTreeNode(data, dropKey, (item) => {
        item.children = item.children || []
        item.children.unshift(dragObj)
      })
    } else {
      findTreeNode(data, dropKey, (item, index, arr) => {
        arr.splice(index + (dropPosition === -1 ? 0 : 1), 0, dragObj)
      })
    }

    onChangeData && onChangeData(set(valueKey, data, userInterfaceData))
  }

  handleSelect = (selectedKeys: string[], event: AntTreeNodeSelectedEvent) => {
    console.log(
      "TreeInterfaceComponent.handleSelect",
      event,
      (event.node as any).isLeaf(),
      selectedKeys
    )

    const {
      allowSelectParents,
      onChangeData,
      selectable,
      selectedKey,
      userInterfaceData,
      valueKey,
    } = this.props

    const data = getOr([], valueKey, userInterfaceData) as TreeNodeNormal[]

    if (
      selectable &&
      (allowSelectParents || (!allowSelectParents && (event.node as any).isLeaf()))
    ) {
      onChangeData &&
        selectedKey &&
        onChangeData(set(selectedKey, findTreeNode(data, selectedKeys[0]), userInterfaceData))
    }
  }

  handleDelete = (item: TreeNodeNormal) => {
    const { onChangeData, selectedKey, userInterfaceData, valueKey } = this.props
    const data = cloneDeep(getOr([], valueKey, userInterfaceData) as TreeNodeNormal[])

    const selected = selectedKey && get(selectedKey, userInterfaceData)

    findTreeNode(data, item.key, (item, index, arr) => {
      arr.splice(index, 1)
    })

    const updatedUserInterfaceData =
      selectedKey && selected === item.key ? set(selectedKey, null, data) : userInterfaceData

    onChangeData && onChangeData(set(valueKey, data, updatedUserInterfaceData))
  }

  render() {
    const {
      addLabel,
      addLeafLabel,
      addParentLabel,
      allowAdd,
      allowAddLeaves,
      allowAddParents,
      allowDetails,
      allowNestInLeaves,
      components,
      detailsOrientation,
      emptyText,
      modifiable,
      onChangeData,
      selectedKey,
      userInterfaceData,
      valueKey,
    } = this.props
    const data = getOr([], valueKey, userInterfaceData) as TreeNodeNormal[]
    const selected = selectedKey && get(selectedKey, userInterfaceData)

    const renderedTree = (
      <>
        {data.length === 0 && <Empty description={emptyText} />}

        <Tree
          showLine
          draggable={modifiable}
          switcherIcon={<Icon type="down" />}
          defaultExpandedKeys={[]}
          onDragOver={this.handleDragOver}
          onDrop={this.handleDrop}
          onSelect={this.handleSelect}
          selectedKeys={selected && [selected.key]}>
          {renderTreeNodes(data, this.handleDelete)}
        </Tree>
      </>
    )

    const renderedDetails = allowDetails && (
      <DataPathContext path="components">
        <ComponentRenderer
          components={components}
          data={selected ? { ...userInterfaceData, ...selected } : userInterfaceData}
          onChangeData={(updatedUserInterfaceData) => {
            const updatedSelected = selectedKey && get(selectedKey, updatedUserInterfaceData)
            const updatedData = cloneDeep(getOr([], valueKey, updatedUserInterfaceData))
            findTreeNode(updatedData, selected.key, (item, index, arr) => {
              arr.splice(index, 1, updatedSelected)
            })
            onChangeData && onChangeData(set(valueKey, updatedData, updatedUserInterfaceData))
          }}
          onChangeSchema={(newSchema) => {
            console.warn(
              "TreeInterfaceComponent.render",
              "TODO: Cannot alter schema inside ComponentRenderer in Tree",
              { newSchema }
            )
          }}
        />
      </DataPathContext>
    )

    return (
      <>
        {orientTreeAndDetails(detailsOrientation, renderedTree, renderedDetails)}
        {modifiable && allowNestInLeaves && allowAdd && (
          <Button onClick={this.addEntry("standard")}>{addLabel}</Button>
        )}
        {modifiable && !allowNestInLeaves && allowAddParents && (
          <Button onClick={this.addEntry("parent")}>{addParentLabel}</Button>
        )}
        {modifiable && !allowNestInLeaves && allowAddLeaves && (
          <Button onClick={this.addEntry("leaf")}>{addLeafLabel}</Button>
        )}
      </>
    )
  }
}

const findTreeNode = (
  data: TreeNodeNormal[],
  key: string,
  callback?: (item: TreeNodeNormal, index: number, arr: TreeNodeNormal[]) => void
): TreeNodeNormal | undefined => {
  // BFS tree traversal. There aren't likely to ever be enough nodes to blow out the stack
  // and the callback function requires more context than is easily provided when you use a stack or queue
  for (let [index, item] of data.entries()) {
    if (item.key === key) {
      if (callback) {
        callback(item, index, data)
      }
      return item
    } else if (item.children) {
      const foundChildNode = findTreeNode(item.children, key, callback)
      if (foundChildNode) {
        return foundChildNode
      }
    }
  }
}

const renderTreeNodes = (data: TreeNodeNormal[], onDelete: (item: TreeNodeNormal) => void) =>
  data.map((item) => {
    if (item.children && item.children.length) {
      return (
        <Tree.TreeNode
          key={item.key}
          isLeaf={item.isLeaf}
          title={
            <>
              {item.title} <Divider type="vertical" className="tree-component-delete-divider" />
              {/* TODO: Replace this confirmable delete with an interface button with confirmation component */}
              <ConfirmableDeleteButton
                className="tree-component-delete-button"
                confirmationMessage={`Are you sure want to delete this item? (All children will be deleted, too)`}
                confirmationTitle={`Confirm Delete`}
                onDelete={() => onDelete(item)}
              />
            </>
          }>
          {renderTreeNodes(item.children, onDelete)}
        </Tree.TreeNode>
      )
    }
    return (
      <Tree.TreeNode
        key={item.key}
        isLeaf={item.isLeaf}
        title={
          <>
            {item.title} <Divider type="vertical" className="tree-component-delete-divider" />
            <ConfirmableDeleteButton
              className="tree-component-delete-button"
              confirmationMessage={`Are you sure want to delete this item?`}
              confirmationTitle={`Confirm Delete`}
              onDelete={() => onDelete(item)}
            />
          </>
        }
      />
    )
  })

function orientTreeAndDetails(
  orientation: TreeInterfaceComponentProps["detailsOrientation"],
  tree: React.ReactNode,
  details: React.ReactNode
) {
  if (orientation === "left")
    return (
      <Row>
        <Col span={8}>{details}</Col>
        <Col span={16}>{tree}</Col>
      </Row>
    )
  else if (orientation === "right")
    return (
      <Row>
        <Col span={8}>{tree}</Col>
        <Col span={16}>{details}</Col>
      </Row>
    )
  else if (orientation === "below")
    return (
      <>
        {tree}
        <Divider />
        {details}
      </>
    )
  else {
    console.warn(
      "TreeInterfaceComponent.orientTreeAndDetails",
      `Tree using default orientation because given orientation was ${orientation}`
    )
    return (
      <>
        {tree}
        {details}
      </>
    )
  }
}
