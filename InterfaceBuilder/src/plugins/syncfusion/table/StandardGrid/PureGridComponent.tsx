import React from "react"
import { GridComponent } from "@syncfusion/ej2-react-grids"
import { deepDiff } from "../../../../lib/deepDiff"
import { isEqual } from "lodash/fp"

/**
 * Are props equal?
 */
export const PureGridComponent = React.memo(GridComponent, (prevProps, nextProps) => {
  const eqColumns = isEqual(prevProps.columns, nextProps.columns)
  const eqDataSource = isEqual(prevProps.dataSource, nextProps.dataSource)

  // Null if props are equal, otherwise a hash of the changed props
  const runDeepDiff = () =>
    deepDiff(prevProps, nextProps, (k) => ["children", "detailTemplate", "valueAccessor"].includes(k))

  // Return true if props are equal, false to re-render
  return eqColumns && eqDataSource && !runDeepDiff()
})
