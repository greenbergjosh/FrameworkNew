import React from "react"
import { Button, Empty, Icon, Tree } from "antd"
import { cloneDeep, get, getOr } from "lodash/fp"
import { ComponentRenderer } from "../../../../components/ComponentRenderer"
import { DataPathContext } from "../../../../contexts/DataPathContext"
import { DisplayModeProps, EntryType } from "../types"
import { findTreeNode } from "../../../../plugins/ant/tree/components/findTreeNode"
import { orientTreeAndDetails } from "../../../../plugins/ant/tree/components/orientTreeAndDetails"
import { renderTreeNodes } from "../../../../plugins/ant/tree/components/renderTreeNodes"
import { AntTreeNodeDropEvent, AntTreeNodeSelectedEvent, TreeNodeNormal } from "antd/lib/tree/Tree"

export function DisplayMode({
  addLabel,
  addLeafLabel,
  addParentLabel,
  allowAdd,
  allowAddLeaves,
  allowAddParents,
  allowDetails,
  allowNestInLeaves,
  allowSelectParents,
  components,
  data,
  detailsOrientation,
  emptyText,
  getRootUserInterfaceData,
  getValue,
  modifiable,
  onChangeRootData,
  selectable,
  selectedKey,
  setValue,
  valueKey,
  onChange,
}: DisplayModeProps): JSX.Element {
  /* *************************************
   *
   * PROP WATCHERS
   */

  const selected = selectedKey && getValue(selectedKey)

  /* *************************************
   *
   * EVENT HANDLERS
   */

  /**
   *
   * @param type
   */
  const addEntry = (type: EntryType) => () => {
    const treeData: TreeNodeNormal[] = getValue(valueKey) || []
    const newTreeNode = {
      key: String(Math.random()),
      title: `New ${type} ${Math.round(Math.random() * 100)}`,
    } as TreeNodeNormal
    if (type !== "leaf") {
      newTreeNode.children = []
      newTreeNode.isLeaf = false
    } else {
      newTreeNode.isLeaf = true
    }
    onChange([...treeData, newTreeNode])
  }

  /**
   * Adapated from suggested Ant code at https://ant.design/components/tree/
   * @param event
   */
  const handleDrop = (event: AntTreeNodeDropEvent) => {
    const newTreeData: TreeNodeNormal[] = cloneDeep(getValue(valueKey) || [])
    const dropKey = event.node.props.eventKey || ""
    const dragKey = event.dragNode.props.eventKey || ""
    const dropPos = event.node.props.pos.split("-")
    const dropPosition = event.dropPosition - Number(dropPos[dropPos.length - 1])

    // Find dragObject
    let dragObj: TreeNodeNormal
    findTreeNode(newTreeData, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })

    if (!event.dropToGap && !(event.node as any).isLeaf()) {
      // Drop on the content
      findTreeNode(newTreeData, dropKey, (item) => {
        item.children = item.children || []
        item.children.push(dragObj)
      })
    } else if (
      !(event.node as any).isLeaf() &&
      ((event.node.props.children || []) as TreeNodeNormal[]).length > 0 && // Has children
      event.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      findTreeNode(newTreeData, dropKey, (item) => {
        item.children = item.children || []
        item.children.unshift(dragObj)
      })
    } else {
      findTreeNode(newTreeData, dropKey, (item, index, arr) => {
        arr.splice(index + (dropPosition === -1 ? 0 : 1), 0, dragObj)
      })
    }
    onChange(newTreeData)
  }

  /**
   *
   * @param selectedKeys
   * @param event
   */
  const handleSelect = (selectedKeys: string[], event: AntTreeNodeSelectedEvent) => {
    const treeData: TreeNodeNormal[] = getValue(valueKey) || []
    if (selectable && (allowSelectParents || (!allowSelectParents && (event.node as any).isLeaf()))) {
      const treeNode = findTreeNode(treeData, selectedKeys[0])
      selectedKey && setValue([selectedKey, treeNode])
    }
  }

  /**
   *
   * @param item
   */
  const handleDelete = (item: TreeNodeNormal) => {
    const newTreeData = cloneDeep<TreeNodeNormal[]>(getValue(valueKey) || [])
    findTreeNode(newTreeData, item.key, (item, index, arr) => {
      arr.splice(index, 1)
    })
    onChange(newTreeData)
  }

  /* *************************************
   *
   * RENDER
   */

  const renderedTree = (
    <>
      {data.length === 0 && <Empty description={emptyText} />}
      <Tree
        showLine
        draggable={modifiable}
        switcherIcon={<Icon type="down" />}
        defaultExpandedKeys={[]}
        onDrop={handleDrop}
        onSelect={handleSelect}
        selectedKeys={selected && [selected.key]}>
        {renderTreeNodes(data, handleDelete)}
      </Tree>
    </>
  )

  const renderedDetails = allowDetails && (
    <DataPathContext path="components">
      <ComponentRenderer
        components={components}
        data={selected ? { ...data, ...selected } : data}
        getRootUserInterfaceData={getRootUserInterfaceData}
        onChangeRootData={onChangeRootData}
        onChangeData={(updatedUserInterfaceData) => {
          const updatedSelected = selectedKey && get(selectedKey, updatedUserInterfaceData)
          const updatedData = cloneDeep(getOr([], valueKey, updatedUserInterfaceData))
          findTreeNode(updatedData, selected.key, (item, index, arr) => {
            arr.splice(index, 1, updatedSelected)
          })
          setValue([valueKey, updatedData, updatedUserInterfaceData])
        }}
        onChangeSchema={() => void 0}
      />
    </DataPathContext>
  )

  return (
    <>
      {orientTreeAndDetails(detailsOrientation, renderedTree, renderedDetails)}
      {modifiable && allowNestInLeaves && allowAdd && <Button onClick={addEntry("standard")}>{addLabel}</Button>}
      {modifiable && !allowNestInLeaves && allowAddParents && (
        <Button onClick={addEntry("parent")}>{addParentLabel}</Button>
      )}
      {modifiable && !allowNestInLeaves && allowAddLeaves && <Button onClick={addEntry("leaf")}>{addLeafLabel}</Button>}
    </>
  )
}
