import React from "react"
import { ConfirmableDeleteButton } from "@opg/interface-builder"
import { Divider, Tree } from "antd"
import { TreeNodeNormal } from "antd/lib/tree/Tree"

export const renderTreeNodes = (data: TreeNodeNormal[], onDelete: (item: TreeNodeNormal) => void) =>
  data.map((item) => {
    if (item.children && item.children.length) {
      return (
        <Tree.TreeNode
          key={item.key}
          isLeaf={item.isLeaf}
          title={
            <>
              {item.title} <Divider type="vertical" className="tree-component-delete-divider" />
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
