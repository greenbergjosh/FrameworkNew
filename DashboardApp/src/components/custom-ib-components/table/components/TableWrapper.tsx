import React from "react"
import { ColumnConfig, TableInterfaceComponentProps } from "../types"
import { SortableGroupableColumnModel } from "@opg/interface-builder-plugins/lib/syncfusion/table"
import TableInterfaceComponent from "@opg/interface-builder-plugins/lib/syncfusion/table/TableInterfaceComponent"
import { cloneDeep } from "lodash/fp"
import { getDetailTemplate } from "../../../report/detailTemplate/getDetailTemplate"
import { getCustomCellFormatter } from "../customFormatters/customCellFormatter"
import { getCustomAggregateFunction } from "../customFormatters/customAggregateFunction"
import { useRematch } from "../../../../hooks"
import { store } from "../../../../state/store"

export function TableWrapper(props: TableInterfaceComponentProps): JSX.Element {
  const {
    columns,
    getRootUserInterfaceData,
    onChangeRootData,
    onChangeData,
    parameterValues,
    parentData,
    getDefinitionDefaultValue,
  } = props

  /* **********************************************************************
   *
   * REDUX, STATE, REFS
   */

  const [fromStore, dispatch] = useRematch((appState) => ({
    configsById: store.select.globalConfig.configsById(appState),
    globalConfigPath: appState.navigation.appRoutes.globalConfig.abs,
    isExecutingQuery: appState.loading.effects.reports.executeQuery,
    reportDataByQuery: appState.reports.reportDataByQuery,
  }))

  /*
   * COLUMN TEMPLATES
   * Provide layout components and formatters to columns
   */
  const enrichedColumns = React.useMemo((): SortableGroupableColumnModel[] => {
    return columns.map((column): SortableGroupableColumnModel => {
      const template = getDetailTemplate({
        columnDetails: (column as ColumnConfig).details,
        columnType: column.type,
        dispatch,
        getRootUserInterfaceData,
        onChangeRootData,
        onChangeData,
        parameterValues: parameterValues && parameterValues.toUndefined(),
        parentData,
        getDefinitionDefaultValue,
      })
      const formatter = getCustomCellFormatter({
        cellFormatter: column.cellFormatter,
        cellFormatterOptions: column.cellFormatterOptions,
        columnType: column.type,
        configsById: fromStore.configsById,
        formatter: column.formatter,
        queryParams: parameterValues && parameterValues.toUndefined(),
      })
      const customAggregateFunction = getCustomAggregateFunction(
        column.customAggregateId,
        fromStore.configsById,
        column.aggregationFunction
      )

      return { ...cloneDeep(column), template, formatter, customAggregateFunction }
    })
  }, [
    onChangeData,
    dispatch,
    fromStore.configsById,
    columns,
    parameterValues,
    parentData,
    getRootUserInterfaceData,
    onChangeRootData,
  ])

  return <TableInterfaceComponent {...props} columns={enrichedColumns} />
}
