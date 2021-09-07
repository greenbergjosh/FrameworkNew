import { ComponentDefinition } from "@opg/interface-builder"
import { ListInterfaceComponentProps } from "./types"

export function repeatedInterleave(
  interleave: ListInterfaceComponentProps["interleave"],
  items: any[],
  count: number
): ComponentDefinition[] {
  switch (interleave) {
    case "none": {
      const singleItem = items[0]
      return [...Array(count)].map(() => ({ ...singleItem }))
    }
    case "round-robin": {
      return [...Array(count)].map((_, index) => ({ ...items[index % items.length] }))
    }
    case "set": {
      const realCount = Math.ceil(count / (items.length || 1)) * items.length
      return [...Array(realCount)].map((_, index) => ({ ...items[index % items.length] }))
    }
    default: {
      return []
    }
  }
}
