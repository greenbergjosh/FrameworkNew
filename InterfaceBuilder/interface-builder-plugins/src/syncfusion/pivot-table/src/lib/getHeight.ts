import { Size } from "lib/useWindowSize"

export function getHeight(heightKey: string, height: number, windowSize: Size, isVirtualScrolling?: boolean): string {
  switch (heightKey) {
    case "auto":
      return "auto"
    case "full":
      if (isVirtualScrolling) {
        const windowHeight = windowSize.height || 0
        const approxHeightOfHeaderStuff = 320
        const approxGridSize = windowHeight - approxHeightOfHeaderStuff
        const minPagingHeight = 200
        return `${approxGridSize > minPagingHeight ? approxGridSize : minPagingHeight}px`
      }
      return "100%"
    case "fieldlist":
      return "629px"
    case "value":
      if (height > 0) {
        return `${height}px`
      }
  }
  return "auto"
}
