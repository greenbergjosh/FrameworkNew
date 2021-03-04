import React from "react"
import { ColumnConfig, TableInterfaceComponentProps } from "../types"
import { Table } from "@opg/interface-builder"
import { cloneDeep } from "lodash/fp"
import { getDetailTemplate } from "../../../Report/detailTemplate/getDetailTemplate"
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

  /* **********************************************************************
   *
   * EVENT HANDLERS
   */

  /* **********************************************************************
   *
   * PROPERTY WATCHERS
   */

  /*
   * COLUMN TEMPLATES
   * Provide layout components and formatters to columns
   */
  const enrichedColumns = React.useMemo((): ColumnConfig[] => {
    return columns.map(
      (column: ColumnConfig): ColumnConfig => {
        const template = getDetailTemplate({
          columnDetails: column.details,
          columnType: column.type,
          dispatch,
          getRootUserInterfaceData,
          onChangeData,
          parameterValues: parameterValues.toUndefined(),
          parentData,
        })
        const formatter = getCustomCellFormatter({
          cellFormatter: column.cellFormatter,
          cellFormatterOptions: column.cellFormatterOptions,
          columnType: column.type,
          configsById: fromStore.configsById,
          formatter: column.formatter,
          queryParams: parameterValues.toUndefined(),
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
