import React from "react"
import StandardGrid from "../StandardGrid/StandardGrid"
import { GridComponent, GridModel } from "@syncfusion/ej2-react-grids"
import { DisplayTableProps } from "../types"
import { EncodedFilterBy, encodeFilters, getFilterSettings } from "settings/filterSettings"
import { encodeGroups, getGroupSettings } from "settings/groupSettings"
import { encodePaging, getPageSettings } from "settings/pageSettings"
import { encodeSorts, getSortSettings } from "settings/sortSettings"
import { getValue, JSONRecord } from "@opg/interface-builder"
import { isArray, isEmpty, isEqual } from "lodash/fp"
import { RowDetail } from "./RowDetail"

/**
 * Display Table
 * View the actual grid with data.
 */
export function DisplayTable({
  autoFitColumns,
  columns,
  defaultCollapseAll,
  defaultPageSize,
  enableAltRow,
  enableVirtualization,
  filterByKey,
  getRootUserInterfaceData,
  getValue,
  groupByKey,
  height,
  onChangeRootData,
  orderByKey,
  pagingKey,
  preview = false,
  rowDetails,
  setValue,
  showToolbar,
  userInterfaceData,
  useSmallFont,
  useSmallPager,
  valueKey,
}: DisplayTableProps): JSX.Element {
  const grid = React.useRef<GridComponent>(null)

  /* **********************************
   *
   * Update grid settings from data
   */

  const filterSettings = React.useMemo(() => {
    const filterBy = filterByKey ? getValue(filterByKey) : undefined
    return getFilterSettings(columns, filterBy as unknown as EncodedFilterBy)
  }, [columns, getValue, filterByKey])

  const groupSettings = React.useMemo(() => {
    const groupBy = groupByKey ? getValue(groupByKey) : undefined
    return getGroupSettings(columns, groupBy)
  }, [columns, getValue, groupByKey])

  const pageSettings = React.useMemo(() => {
    const paging = pagingKey ? getValue(pagingKey) : undefined
    return getPageSettings(defaultPageSize, paging)
  }, [defaultPageSize, getValue, pagingKey])

  const sortSettings = React.useMemo(() => {
    const orderBy = orderByKey ? getValue(orderByKey) : undefined
    return getSortSettings(columns, orderBy)
  }, [columns, getValue, orderByKey])

  /**
   * Event Handler
   * Updates model from grid actions. Triggers when Grid actions such as
   * sorting, filtering, paging, grouping, etc. begin.
   * @param arg DialogEditEventArgs
   */
  const handleActionBegin: GridModel["actionBegin"] = React.useCallback(
    (arg): void => {
      switch (arg.requestType) {
        case "filtering":
          if (filterByKey) {
            const filterBy = filterByKey ? getValue(filterByKey) : undefined
            const nextEncoded = encodeFilters(arg, filterBy)
            setValue([filterByKey, nextEncoded])
          }
          break
        case "grouping":
          if (groupByKey) {
            const groupBy = groupByKey ? getValue(groupByKey) : undefined
            setValue([groupByKey, encodeGroups(arg, groupBy)])
          }
          break
        case "ungrouping":
          if (groupByKey) {
            const groupBy = groupByKey ? getValue(groupByKey) : undefined
            setValue([groupByKey, encodeGroups(arg, groupBy)])
          }
          break
        case "paging":
          if (pagingKey) {
            console.log({ pageSettings, grid })
            const totalRecordsCount = (grid.current && grid.current.pageSettings.totalRecordsCount) || undefined
            const pageSize = (grid.current && grid.current.pageSettings.pageSize) || defaultPageSize
            setValue([pagingKey, encodePaging(arg, pageSize, totalRecordsCount)])
          }
          break
        case "sorting":
          if (orderByKey) {
            console.log({ sortSettings, grid })
            const sortBy = orderByKey ? getValue(orderByKey) : undefined
            setValue([orderByKey, encodeSorts(arg, sortBy)])
          }
      }
    },
    [pageSettings, defaultPageSize, orderByKey, pagingKey, filterByKey, groupByKey, getValue, setValue, sortSettings]
  )

  let dataArray: JSONRecord[] = []
  if (valueKey) {
    const val = getValue(valueKey) as JSONRecord
    if (val && !isEmpty(val)) {
      if (isArray(val)) {
        dataArray = val
      } else {
        dataArray = [val]
      }
    }
  }

  return (
    <StandardGrid
      actionBegin={handleActionBegin}
      autoFitColumns={autoFitColumns}
      columns={columns}
      contextData={userInterfaceData}
      data={preview ? [] : dataArray} //<-- preview mode does not have data, so use empty array
      defaultCollapseAll={defaultCollapseAll}
      enableAltRow={enableAltRow}
      enableVirtualization={enableVirtualization}
      filterSettings={filterSettings}
      groupSettings={groupSettings}
      height={height}
      pageSettings={pageSettings}
      ref={grid}
      showToolbar={showToolbar}
      sortSettings={sortSettings}
      useSmallFont={useSmallFont}
      useSmallPager={useSmallPager}
      detailTemplate={
        rowDetails && rowDetails.length
          ? (parentData: any) => (
              <RowDetail
                components={rowDetails}
                getRootUserInterfaceData={getRootUserInterfaceData}
                onChangeRootData={onChangeRootData}
                mode="display"
                onChangeData={(newData: any) => {
                  setValue([valueKey, newData])
                }}
                parentRowData={parentData}
              />
            )
          : undefined
      }
    />
  )
}

/**
 *
 * @param prevProps
 * @param nextProps
 */
function propsAreEqual(prevProps: DisplayTableProps, nextProps: DisplayTableProps) {
  // const filterByIsEqual = isPropEqual(prevProps, nextProps, "filterByKey")
  // if (!filterByIsEqual) return false
  //
  // const groupByIsEqual = isPropEqual(prevProps, nextProps, "groupByKey")
  // if (!groupByIsEqual) return false
  //
  // const pagingIsEqual = isPropEqual(prevProps, nextProps, "pagingKey")
  // if (!pagingIsEqual) return false
  //
  // const orderByIsEqual = isPropEqual(prevProps, nextProps, "orderByKey")
  // if (!orderByIsEqual) return false

  return isPropEqual(prevProps, nextProps, "valueKey")
}

export default React.memo(DisplayTable, propsAreEqual)

/**
 *
 * @param prevProps
 * @param nextProps
 * @param key
 */
function isPropEqual(prevProps: Record<string, any>, nextProps: Record<string, any>, key: string) {
  const prevValue =
    prevProps[key] && getValue(prevProps[key], prevProps.userInterfaceData, prevProps.getRootUserInterfaceData)
  const nextValue =
    nextProps[key] && getValue(nextProps[key], nextProps.userInterfaceData, nextProps.getRootUserInterfaceData)
  return isEqual(prevValue, nextValue)
}
