import React from "react"
import { GridComponent } from "@syncfusion/ej2-react-grids"
import { shallowPropCheck } from "../../../../lib/shallowPropCheck"
import { deepDiff } from "../../../../lib/deepDiff"

/**
 * Are props equal?
 */
export const PureGridComponent = React.memo(GridComponent, (prevProps, nextProps) => {
  // True if props are equal
  const simplePropEquality = shallowPropCheck(["columns", "dataSource"])(prevProps, nextProps)

  // Null if props are equal, otherwise a hash of the changed props
  const runDeepDiff = () =>
    deepDiff(prevProps, nextProps, (k) => ["children", "detailTemplate", "valueAccessor"].includes(k))
  const deepDiffResult = runDeepDiff()

  // Return true if props are equal, false to re-render
  return simplePropEquality && !deepDiffResult
})
