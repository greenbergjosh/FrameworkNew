import React from "react"
import { GridComponent } from "@syncfusion/ej2-react-grids"
import { StandardGrid } from "@opg/interface-builder"
import { isEqual } from "lodash/fp"
import { DisplayTableProps } from "./types"

export function DisplayTable(
  {
    autoFitColumns,
    columns,
    contextData,
    data,
    defaultCollapseAll,
    detailTemplate,
    enableAltRow,
    enableVirtualization,
    groupSettings,
    height,
    loading,
    pageSettings,
    sortSettings,
    useSmallFont,
  }: DisplayTableProps,
  ref?: React.Ref<GridComponent>
): JSX.Element {
  return (
    <StandardGrid
      allowAdding={false}
      allowDeleting={false}
      allowEditing={false}
      ref={ref}
      columns={columns}
      contextData={contextData}
      data={data}
      detailTemplate={detailTemplate}
      loading={loading}
      sortSettings={sortSettings}
      groupSettings={groupSettings}
      pageSettings={pageSettings}
      defaultCollapseAll={defaultCollapseAll}
      autoFitColumns={autoFitColumns}
      useSmallFont={useSmallFont}
      enableAltRow={enableAltRow}
      enableVirtualization={enableVirtualization}
      height={height}
    />
  )
}

function propsAreEqual(prevProps: DisplayTableProps, nextProps: DisplayTableProps) {
  return isEqual(prevProps.data, nextProps.data) && isEqual(prevProps.loading, nextProps.loading)
}

export default React.memo(React.forwardRef(DisplayTable), propsAreEqual)
