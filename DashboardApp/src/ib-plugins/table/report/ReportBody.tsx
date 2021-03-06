import React from "react"
import { Helmet } from "react-helmet"
import * as Reach from "@reach/router"
import * as record from "fp-ts/lib/Record"
import { empty as emptyArray, isEmpty as fptsIsEmpty } from "fp-ts/lib/Array"
import { cloneDeep, matches, sortBy, isEmpty } from "lodash/fp"
import { Button, Icon, PageHeader, Spin } from "antd"
import { JSONRecord } from "../../../lib/JSONRecord"
import { getDefaultFormValues, QueryForm } from "../../_shared/query/QueryForm"
import { store } from "../../../state/store"
import { useRematch } from "../../../hooks"
import * as Table from "@opg/interface-builder-plugins/lib/syncfusion/table"
import { getDetailTemplate } from "./detailTemplate/getDetailTemplate"
import { ColumnConfig } from "../types"
import { getCustomAggregateFunction } from "../customFormatters/customAggregateFunction"
import { getCustomCellFormatter } from "../customFormatters/customCellFormatter"
import { ReportBodyProps } from "./types"
import { cheapHash } from "../../../lib/json"
import { some } from "fp-ts/lib/Option"
import DisplayTable from "./DisplayTable"

const ReportBody = ({
  getRootUserInterfaceData,
  onChangeRootData,
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
  getDefinitionDefaultValue,
}: ReportBodyProps) => {
  /* **********************************************************************
   *
   * REDUX, STATE, REFS
   */

  const [fromStore, dispatch] = useRematch((appState) => ({
    configsById: store.select.globalConfig.configsById(appState),
    globalConfigPath: appState.navigation.routes.globalConfig.abs,
    isExecutingQuery: appState.loading.effects.reports.executeQuery,
    reportDataByQuery: appState.reports.reportDataByQuery,
  }))

  const [automaticQueryErrorState, setAutomaticQueryErrorState] = React.useState(null)

  const grid = React.useRef<Table.GridComponent>(null)

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

  /**
   * Execute Query on user submit
   */
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

  function handleQueryFormMount(parameterValues: JSONRecord) {
    console.log("Submitted Form Data", parameterValues)
  }

  /* **********************************************************************
   *
   * PROPERTY WATCHERS
   */

  /*
   * Get report data hash key (query route + params)
   * example hash key: '"edwLab:pathExpenseReport1SessionDate"{"startDate":"","endDate":""}'
   */
  const hashKey = React.useMemo(() => {
    return parameterValues.foldL(
      // None
      () => cheapHash(queryConfig.query, satisfiedByParentParams),
      // Some
      (params) => cheapHash(queryConfig.query, { ...satisfiedByParentParams, ...params })
    )
  }, [parameterValues, queryConfig.query, satisfiedByParentParams])

  const { queryResultDataIsNone, data } = React.useMemo(() => {
    const dataOption = record.lookup(hashKey, fromStore.reportDataByQuery)
    const isNone: boolean = dataOption.isNone()
    const data: JSONRecord[] = dataOption.getOrElse(emptyArray)
    return { queryResultDataIsNone: isNone, data }
  }, [fromStore.reportDataByQuery, hashKey])

  /**
   * Execute Query on page mount when executeImmediately is not turned off.
   */
  React.useEffect(() => {
    if (
      !automaticQueryErrorState &&
      !fromStore.isExecutingQuery &&
      queryResultDataIsNone &&
      (!unsatisfiedByParentParams.length || withoutHeader)
    ) {
      // ExecuteImmediately is performed by default (not set) or when toggled on.
      if (queryConfig.executeImmediately === undefined || queryConfig.executeImmediately) {
        const defaultFormValues = getDefaultFormValues(
          queryConfig.layout,
          queryConfig.parameters,
          {},
          getDefinitionDefaultValue
        )
        const params = { ...satisfiedByParentParams }

        // Add query form field default values to the params
        // but only when there is already an existing param.
        for (const defaultFormValuesKey in defaultFormValues) {
          if (isEmpty(satisfiedByParentParams[defaultFormValuesKey])) {
            params[defaultFormValuesKey] = defaultFormValues[defaultFormValuesKey]
          }
        }

        dispatch.reports
          .executeQuery({
            resultURI: cheapHash(queryConfig.query, satisfiedByParentParams),
            query: queryConfig,
            params,
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
    fromStore.isExecutingQuery,
    getDefinitionDefaultValue,
    queryConfig,
    queryConfig.query,
    queryResultDataIsNone,
    satisfiedByParentParams,
    unsatisfiedByParentParams.length,
    withoutHeader,
  ])

  /*
   * Detail Template
   */
  const getMemoizedDetailTemplate = React.useMemo(() => {
    return getDetailTemplate({
      columnDetails: reportConfig.details,
      columnType: "layout",
      dispatch,
      getDefinitionDefaultValue,
      getRootUserInterfaceData,
      handleChangeData: onChangeData,
      onChangeRootData,
      parameterValues: parameterValues.toUndefined(),
      parentData,
    })
  }, [
    dispatch,
    getDefinitionDefaultValue,
    getRootUserInterfaceData,
    onChangeData,
    onChangeRootData,
    parameterValues,
    parentData,
    reportConfig.details,
  ])

  const sortSettings: Table.StandardGridTypes.SortSettingsModel = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: sortBy("sortOrder", reportConfig.columns as any[]).reduce((acc, column) => {
      if (column.sortDirection && column.field) {
        acc.push({ field: column.field, direction: column.sortDirection })
      }
      return acc
    }, [] as Table.StandardGridTypes.SortDescriptorModel[]),
  }

  const pageSettings: Table.StandardGridTypes.PageSettingsModel | undefined =
    reportConfig.defaultPageSize === "All"
      ? {
          pageSize: 999999,
        }
      : typeof reportConfig.defaultPageSize === "number"
      ? {
          pageSize: reportConfig.defaultPageSize,
        }
      : undefined

  const groupSettings: Table.StandardGridTypes.GroupSettingsModel = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: sortBy("groupOrder", reportConfig.columns as any[]).reduce((acc, column) => {
      if (column.field && typeof column.groupOrder !== "undefined") {
        acc.push(column.field)
      }
      return acc
    }, [] as string[]),
  }

  const contextData = React.useMemo(() => {
    const cd: JSONRecord = { ...parentData, ...parameterValues.getOrElse(record.empty) }
    return cd
  }, [parameterValues, parentData])

  /*
   * ADD COLUMN TEMPLATES & FORMATTERS
   * Provide layout components and formatters to columns.
   */
  const columns: ColumnConfig[] = React.useMemo(() => {
    return reportConfig.columns.map((column: ColumnConfig): ColumnConfig => {
      const template = getDetailTemplate({
        dispatch,
        columnDetails: column.details,
        getRootUserInterfaceData,
        onChangeRootData,
        parameterValues: parameterValues.toUndefined(),
        parentData,
        handleChangeData: onChangeData,
        columnType: column.type,
        getDefinitionDefaultValue,
      })

      /*
       * Render a formatted string (that may include HTML) into a cell.
       * NOTE: A cell can have either a "layout" or a "formatter" but not both.
       */
      const formatter = getCustomCellFormatter({
        cellFormatter: column.cellFormatter,
        cellFormatterOptions: column.cellFormatterOptions,
        columnType: column.type,
        configsById: fromStore.configsById,
        formatter: column.formatter,
        queryParams: parameterValues.toUndefined(),
      })

      /*
       * Render a formatted string (that may include HTML) into a summary row cell.
       */
      const customAggregateFunction = getCustomAggregateFunction(
        column.customAggregateId,
        fromStore.configsById,
        column.aggregationFunction
      )

      return { ...cloneDeep(column), template, formatter, customAggregateFunction }
    })
  }, [
    dispatch,
    fromStore.configsById,
    getDefinitionDefaultValue,
    getRootUserInterfaceData,
    onChangeData,
    onChangeRootData,
    parameterValues,
    parentData,
    reportConfig.columns,
  ]) // Even though we are in display mode, we still need to update columns.

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
        (reportId.isSome() || typeof title !== "undefined" || !fptsIsEmpty(unsatisfiedByParentParams)) && (
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
              getRootUserInterfaceData={getRootUserInterfaceData}
              onChangeRootData={onChangeRootData}
              layout={queryConfig.layout}
              parameters={unsatisfiedByParentParams}
              parameterValues={parameterValues.getOrElse(record.empty)}
              onSubmit={handleQueryFormSubmit}
              onMount={handleQueryFormMount}
              getDefinitionDefaultValue={getDefinitionDefaultValue}
            />
          </PageHeader>
        )}

      <div>
        <Spin spinning={fromStore.isExecutingQuery} indicator={<Icon type="loading" />}>
          <DisplayTable
            autoFitColumns={reportConfig.autoFitColumns}
            columns={columns}
            contextData={contextData}
            data={data}
            defaultCollapseAll={reportConfig.defaultCollapseAll}
            detailTemplate={getMemoizedDetailTemplate}
            enableAltRow={reportConfig.enableAltRow}
            enableVirtualization={reportConfig.enableVirtualization}
            groupSettings={groupSettings}
            height={reportConfig.height}
            key={reportId.getOrElse("no-report-id")}
            pageSettings={pageSettings}
            ref={grid}
            sortSettings={sortSettings}
            useSmallFont={reportConfig.useSmallFont}
          />
        </Spin>
      </div>
    </>
  )
}

export default React.memo(ReportBody)
