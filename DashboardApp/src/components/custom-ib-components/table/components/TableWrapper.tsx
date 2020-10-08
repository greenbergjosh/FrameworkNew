import React from "react"
import { ColumnModel } from "@syncfusion/ej2-react-grids"
import { TableInterfaceComponentProps } from "../types"
import { EnrichedColumnDefinition, Table } from "@opg/interface-builder"
import { cloneDeep } from "lodash/fp"
import { ColumnConfig } from "../../../report/templates/types"
import { getDetailTemplate } from "../../../report/templates/getDetailTemplate"
import { getCellFormatter } from "../../../report/templates/cellFormatter"
import { getCustomAggregateFunction } from "../../../report/templates/customAggregateFunction"
import { useRematch } from "../../../../hooks"
import { store } from "../../../../state/store"

export function TableWrapper(props: TableInterfaceComponentProps) {
  const { columns, onChangeData, parameterValues, parentData } = props

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
  const enrichedColumns: EnrichedColumnDefinition[] = React.useMemo(() => {
    // Intentionally mutating a clone
    return cloneDeep(columns).map((column) => {
      const columnConfig = (column as unknown) as ColumnConfig

      // Render a UserInterface (with JSX Elements) into a cell.
      if (columnConfig.type === "layout") {
        // NOTE: Syncfusion grid does not type or document that "template"
        // accepts React JSX Elements, so we ignore the Typescript error.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        columnConfig.template = getDetailTemplate(
          dispatch,
          columnConfig.details,
          parameterValues.toUndefined(),
          parentData,
          onChangeData
        )
      }

      /*
       * Render a formatted string (that may include HTML) into a cell.
       * NOTE: A cell can have either a "layout" or a "formatter" but not both.
       */
      if (columnConfig.cellFormatter && columnConfig.type !== "layout") {
        const formatter = getCellFormatter(
          columnConfig.formatter,
          columnConfig.cellFormatter,
          columnConfig.cellFormatterOptions,
          fromStore.configsById,
          parameterValues.toUndefined()
        )
        if (typeof formatter === "function") {
          columnConfig.formatter = formatter
          columnConfig.disableHtmlEncode = false
        }
      }

      // Render a formatted string (that may include HTML) into a summary row cell.
      if (columnConfig.aggregationFunction === "Custom" && columnConfig.customAggregateId) {
        const customAggregateFunction = getCustomAggregateFunction(
          columnConfig.customAggregateId,
          fromStore.configsById
        )
        if (typeof customAggregateFunction === "function") {
          columnConfig.customAggregateFunction = customAggregateFunction
        }
      }

      return columnConfig
    })
  }, [onChangeData, dispatch, fromStore.configsById, columns, parameterValues, parentData])

  return <Table.TableInterfaceComponent {...props} columns={enrichedColumns} />
}
