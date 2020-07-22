import React from "react"
import { GridComponent } from "@syncfusion/ej2-react-grids"
import { shallowPropCheck } from "components/interface-builder/dnd"
import { deepDiff } from "components/interface-builder/lib/deep-diff"

export const PureGridComponent = React.memo(GridComponent, (prevProps, nextProps) => {
  // Returns true if we should not re-render
  const simplePropEquality = shallowPropCheck(["columns", "dataSource"])(prevProps, nextProps)
  // Returns null if we should not re-render
  const runDeepDiff = () =>
    deepDiff(prevProps, nextProps, (k) =>
      ["children", "detailTemplate", "valueAccessor"].includes(k)
    )

  const deepDiffResult = runDeepDiff()
  return simplePropEquality && !deepDiffResult
})
