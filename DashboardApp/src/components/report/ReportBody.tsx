import React from "react"
import { Helmet } from "react-helmet"
import * as Reach from "@reach/router"
import * as record from "fp-ts/lib/Record"
import { empty as emptyArray, isEmpty } from "fp-ts/lib/Array"
import { cloneDeep, matches, sortBy } from "lodash/fp"
import { Button, PageHeader } from "antd"
import { EnrichedColumnDefinition, StandardGrid } from "@opg/interface-builder"
import { JSONRecord } from "../../data/JSON"
import { QueryForm } from "../query/QueryForm"
import { store } from "../../state/store"
import { useRematch } from "../../hooks"
import {
  GridComponent,
  GroupSettingsModel,
  PageSettingsModel,
  SortDescriptorModel,
  SortSettingsModel,
} from "@syncfusion/ej2-react-grids"
import { getDetailTemplate } from "./templates/getDetailTemplate"
import { ColumnConfig } from "./templates/types"
import { getCustomAggregateFunction } from "./templates/customAggregateFunction"
import { getCellFormatter } from "./templates/cellFormatter"
import { ReportBodyProps } from "./types"
import { cheapHash } from "../../lib/json"
import { some } from "fp-ts/lib/Option"

export const ReportBody = React.memo(
  ({
    isChildReport,
    parameterValues,
    parentData,
    queryConfig,
    reportConfig,
    reportId,
    satisfiedByParentParams,
    setParameterValues,
    title,
    unsatisfiedByParentParams,
    withoutHeader,
  }: ReportBodyProps) => {
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

    const [automaticQueryErrorState, setAutomaticQueryErrorState] = React.useState(null)

    const grid = React.useRef<GridComponent>(null)

    /* **********************************************************************
     *
     * EVENT HANDLERS
     */

    const onChangeData = React.useCallback((oldData: JSONRecord, newData: JSONRecord) => {
      if (grid && grid.current) {
        /*
         * If the dataSource is an array of JavaScript objects, then Grid will create instance of DataManager.
         * https://ej2.syncfusion.com/react/documentation/api/grid/
         */
        const ds = grid.current.dataSource as JSONRecord[]
        const idx = ds.findIndex((item) => matches(item)(oldData))
        if (idx && idx > -1) {
          ds[idx] = { ...newData }
          grid.current.refresh()
        }
      }
    }, [])

    const handleQueryFormSubmit = React.useCallback(
      (parameterValues: JSONRecord) => {
        const queryResultURI = cheapHash(queryConfig.query, {
          ...satisfiedByParentParams,
          ...parameterValues,
        })

        setParameterValues(some(parameterValues))

        dispatch.reports
          .executeQuery({
            resultURI: queryResultURI,
            query: queryConfig,
            params: { ...satisfiedByParentParams, ...parameterValues },
          })
          .catch((ex) => {
            console.error(
              "ReportBody.tsx",
              "Server failure executing query",
              {
                resultURI: queryResultURI,
                query: queryConfig,
                params: { ...satisfiedByParentParams, ...parameterValues },
              },
              ex
            )
          })
      },
      [dispatch.reports, satisfiedByParentParams, queryConfig, setParameterValues]
    )

    /* **********************************************************************
     *
     * PROPERTY WATCHERS
     */

    /*
     * Get report data by hash key (query route + params)
     * example hash key: '"edwLab:pathExpenseReport1SessionDate"{"startDate":"","endDate":""}'
     */
    const queryResultData = React.useMemo(() => {
      const hashKey = cheapHash(queryConfig.query, satisfiedByParentParams)
      return parameterValues.foldL(
        // None
        () => record.lookup(hashKey, fromStore.reportDataByQuery),
        // Some
        (params) =>
          record.lookup(
            cheapHash(queryConfig.query, { ...satisfiedByParentParams, ...params }),
            fromStore.reportDataByQuery
          )
      )
    }, [fromStore.reportDataByQuery, parameterValues, queryConfig.query, satisfiedByParentParams])

    /*
     * Execute Query
     */
    React.useEffect(() => {
      if (
        !automaticQueryErrorState &&
        !fromStore.isExecutingQuery &&
        queryResultData.isNone() &&
        (!unsatisfiedByParentParams.length || withoutHeader)
      ) {
        if (queryConfig.executeImmediately === undefined || queryConfig.executeImmediately) {
          dispatch.reports
            .executeQuery({
              resultURI: cheapHash(queryConfig.query, satisfiedByParentParams),
              query: queryConfig,
              params: satisfiedByParentParams,
            })
            .catch((ex) => {
              console.error(
                "ReportBody.tsx",
                "Server failure executing query",
                {
                  resultURI: cheapHash(queryConfig.query, satisfiedByParentParams),
                  query: queryConfig.query,
                  params: satisfiedByParentParams,
                },
                ex
              )
              setAutomaticQueryErrorState(typeof ex === "function" ? () => ex : ex)
            })
        }
      }
    }, [
      automaticQueryErrorState,
      dispatch,
      unsatisfiedByParentParams.length,
      queryResultData,
      // queryResultData.isNone(),
      queryConfig,
      queryConfig.query,
      satisfiedByParentParams,
      fromStore.isExecutingQuery,
      withoutHeader,
    ])

    /*
     * Detail Template
     */
    const getMemoizedDetailTemplate = React.useMemo(() => {
      return getDetailTemplate(dispatch, reportConfig.details, parameterValues.toUndefined(), parentData, onChangeData)
    }, [dispatch, onChangeData, reportConfig.details, parameterValues, /*parameterValues.toUndefined(),*/ parentData])

    const sortSettings: SortSettingsModel = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      columns: sortBy("sortOrder", reportConfig.columns as any[]).reduce((acc, column) => {
        if (column.sortDirection && column.field) {
          acc.push({ field: column.field, direction: column.sortDirection })
        }
        return acc
      }, [] as SortDescriptorModel[]),
    }

    const pageSettings: PageSettingsModel | undefined =
      reportConfig.defaultPageSize === "All"
        ? {
            pageSize: 999999,
          }
        : typeof reportConfig.defaultPageSize === "number"
        ? {
            pageSize: reportConfig.defaultPageSize,
          }
        : undefined

    const groupSettings: GroupSettingsModel = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      columns: sortBy("groupOrder", reportConfig.columns as any[]).reduce((acc, column) => {
        if (column.field && typeof column.groupOrder !== "undefined") {
          acc.push(column.field)
        }
        return acc
      }, [] as string[]),
    }

    const contextData = React.useMemo(() => ({ ...parentData, ...parameterValues.getOrElse(record.empty) }), [
      parameterValues,
      // parameterValues.getOrElse(record.empty),
      parentData,
    ])

    /*
     * COLUMN TEMPLATES
     * Provide layout components and formatters to columns
     */
    const columns: EnrichedColumnDefinition[] = React.useMemo(() => {
      // Intentionally mutating a clone
      return cloneDeep(reportConfig.columns).map((column) => {
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
    }, [onChangeData, dispatch, fromStore.configsById, reportConfig.columns, parameterValues, parentData])

    /* **********************************************************************
     *
     * RENDER
     */

    return (
      <>
        {!isChildReport && (
          <Helmet>
            <title>{title || "Unknown Report"} | Reports | Channel Admin | OPG</title>
          </Helmet>
        )}
        {withoutHeader !== true &&
          (reportId.isSome() || typeof title !== "undefined" || !isEmpty(unsatisfiedByParentParams)) && (
            <PageHeader
              extra={reportId.fold(null, (id) => (
                <Button.Group size="small">
                  <Button>
                    <Reach.Link to={`${fromStore.globalConfigPath}/${id}`}>View Config</Reach.Link>
                  </Button>
                </Button.Group>
              ))}
              style={{ padding: "15px" }}
              title={title && `Report: ${title}`}>
              <QueryForm
                layout={queryConfig.layout}
                parameters={unsatisfiedByParentParams}
                parameterValues={parameterValues.getOrElse(record.empty)}
                onSubmit={handleQueryFormSubmit}
              />
            </PageHeader>
          )}

        <div>
          <StandardGrid
            key={reportId.getOrElse("no-report-id")}
            ref={grid}
            columns={columns}
            contextData={contextData}
            data={queryResultData.getOrElse(emptyArray)}
            detailTemplate={getMemoizedDetailTemplate}
            loading={fromStore.isExecutingQuery}
            sortSettings={sortSettings}
            groupSettings={groupSettings}
            pageSettings={pageSettings}
            defaultCollapseAll={reportConfig.defaultCollapseAll}
            autoFitColumns={reportConfig.autoFitColumns}
            useSmallFont={reportConfig.useSmallFont}
            enableAltRow={reportConfig.enableAltRow}
            enableVirtualization={reportConfig.enableVirtualization}
            height={reportConfig.height}
          />
        </div>
      </>
    )
  }
)
