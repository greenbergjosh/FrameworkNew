import React from "react"
import { ColumnConfig, TableInterfaceComponentProps } from "../types"
import { SortableGroupableColumnModel, Table } from "@opg/interface-builder"
import { cloneDeep } from "lodash/fp"
import { getDetailTemplate } from "../../../report/detailTemplate/getDetailTemplate"
import { getCustomCellFormatter } from "../customFormatters/customCellFormatter"
import { getCustomAggregateFunction } from "../customFormatters/customAggregateFunction"
import { useRematch } from "../../../../hooks"
import { store } from "../../../../state/store"

export function TableWrapper(props: TableInterfaceComponentProps): JSX.Element {
  const { columns, getRootUserInterfaceData, onChangeData, parameterValues, parentData } = props

  /* **********************************************************************
   *
   * REDUX, STATE, REFS
   */

  const [fromStore, dispatch] = useRematch((appState) => ({
    configsById: store.select.globalConfig.configsById(appState),
    globalConfigPath: appState.navigation.routes.dashboard.subroutes["global-config"].abs,
    isExecutingQuery: appState.loading.effects.reports.executeQuery,
    reportDataByQuery: appState.reports.reportDataByQuery,
  }))

  /*
   * COLUMN TEMPLATES
   * Provide layout components and formatters to columns
   */
  const enrichedColumns = React.useMemo((): SortableGroupableColumnModel[] => {
    return columns.map(
      (column): SortableGroupableColumnModel => {
        const template = getDetailTemplate({
          columnDetails: (column as ColumnConfig).details,
          columnType: column.type,
          dispatch,
          getRootUserInterfaceData,
          onChangeData,
          parameterValues: parameterValues && parameterValues.toUndefined(),
          parentData,
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
      }
    )
  }, [onChangeData, dispatch, fromStore.configsById, columns, parameterValues, parentData, getRootUserInterfaceData])

  return <Table.TableInterfaceComponent {...props} columns={enrichedColumns} />
}
