import { TreeNodeNormal } from "antd/lib/tree/Tree"

export const findTreeNode = (
  data: TreeNodeNormal[],
  key: string,
  callback?: (item: TreeNodeNormal, index: number, arr: TreeNodeNormal[]) => void
): TreeNodeNormal | undefined => {
  /*
   * BFS tree traversal. There aren't likely to ever be enough nodes to blow out the stack,
   * and the callback function requires more context than is easily provided when you use a stack or queue.
   */
  for (const [index, item] of data.entries()) {
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
