import { Config, ImmutableTree } from "react-awesome-query-builder"
import { Map } from "immutable"

export function suppressionFormat(tree: ImmutableTree, config: Config): Record<string, any> {
  const formatted = formatNode(tree, config)
  return {
    Expression: formatted,
  }
}

function formatNode(tree: ImmutableTree, config: Config): Record<string, any> {
  if (!tree) return {}
  const type = tree.get("type")
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const properties = tree.get("properties") || new Map()
  const children = tree.get("children1") as ImmutableTree

  if ((type === "group" || type === "rule_group") && children && children.size) {
    const list = children
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      .map((currentChild: ImmutableTree) => formatNode(currentChild, config, {}))
      .filter((currentChild: any) => typeof currentChild !== "undefined")
    // forOwn(tree, function (value, key: string) {
    //   // @ts-ignore
    //   out[key] = `Transformed value: ${value}`
    // })
    return list
  }
  return {}
}
