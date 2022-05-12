import React from "react"
import { PivotViewComponent } from "@syncfusion/ej2-react-pivotview"
import { Size } from "lib/useWindowSize"

/**
 * PivotView height
 * @param pivotRef
 * @param heightKey
 * @param height
 * @param windowSize
 * @param isVirtualScrolling
 */
export function getHeightKeyValue({
  height,
  heightKey,
  isVirtualScrolling,
  pivotRef,
  windowSize,
}: {
  height: number
  heightKey: string
  isVirtualScrolling?: boolean
  pivotRef: PivotViewComponent | null
  windowSize: Size
}): React.CSSProperties["height"] {
  switch (heightKey) {
    case "auto":
      return "auto"
    case "full":
      if (isVirtualScrolling) {
        const contentHeight = getPivotViewContentHeight(pivotRef, windowSize)
        return `${contentHeight}px`
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

/**
 * Window height available for PivotView content panel
 * @param pivotRef
 * @param windowSize
 */
export function getPivotViewContentHeight(pivotRef: PivotViewComponent | null, windowSize: Size): number {
  const bottomMargin = 20
  let gridContentTop = 303 // Approx height of header stuff -- we can't know until the grid renders.
  if (pivotRef) {
    const pivotTableEl = pivotRef.element
    const gridContent = pivotTableEl.getElementsByClassName("e-gridcontent")[0]
    gridContentTop = gridContent.getBoundingClientRect().top
  }
  return windowSize.height - gridContentTop - bottomMargin
}
