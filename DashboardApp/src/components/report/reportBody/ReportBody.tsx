import React from "react"
import { Helmet } from "react-helmet"
import * as Reach from "@reach/router"
import * as record from "fp-ts/lib/Record"
import { none, Option, some } from "fp-ts/lib/Option"
import { empty as emptyArray, isEmpty } from "fp-ts/lib/Array"
import { matches, sortBy } from "lodash/fp"
import { Button, PageHeader } from "antd"
import { EnrichedColumnDefinition, StandardGrid } from "@opg/interface-builder"
import { cheapHash } from "../../../lib/json"
import { determineSatisfiedParameters } from "../../../lib/determine-satisfied-parameters"
import { JSONRecord } from "../../../data/JSON"
import { LocalReportConfig, QueryConfig } from "../../../data/Report"
import { QueryForm } from "./QueryForm"
import { store } from "../../../state/store"
import { useRematch } from "../../../hooks"
import {
  ColumnModel,
  GridComponent,
  GroupSettingsModel,
  PageSettingsModel,
  SortDescriptorModel,
  SortSettingsModel,
} from "@syncfusion/ej2-react-grids"
import { getDetailTemplate } from "../templates/getDetailTemplate"
import { ColumnConfig } from "../templates/types"

export interface ReportBodyProps {
  isChildReport?: boolean
  parentData?: JSONRecord
  queryConfig: QueryConfig
  reportConfig: LocalReportConfig
  reportId: Option<string>
  title?: string
  withoutHeader?: boolean
}

export const ReportBody = React.memo(
  ({
    isChildReport,
    parentData,
    queryConfig,
    reportConfig,
    reportId,
    title,
    withoutHeader,
  }: ReportBodyProps) => {
    const [fromStore, dispatch] = useRematch((state) => ({
      configs: state.globalConfig.configs,
      configsById: store.select.globalConfig.configsById(state),
      globalConfigPath: state.navigation.routes.dashboard.subroutes["global-config"].abs,
      isExecutingQuery: state.loading.effects.reports.executeQuery,
      reportDataByQuery: state.reports.reportDataByQuery,
    }))

    const grid = React.useRef<GridComponent>(null)

    const { satisfiedByParentParams, unsatisfiedByParentParams } = React.useMemo(
      () => determineSatisfiedParameters(queryConfig.parameters, parentData || {}, true),
      [parentData, queryConfig.parameters]
    )

    const [queryResultUri, setQueryResultUri] = React.useState(none as Option<string>)
    const [parameterValues, setParameterValues] = React.useState(none as Option<JSONRecord>)
    const [automaticQueryErrorState, setAutomaticQueryErrorState] = React.useState<any>(null)

    const queryResultData = React.useMemo(
      () =>
        parameterValues.foldL(
          () =>
            record.lookup(
              cheapHash(queryConfig.query, satisfiedByParentParams),
              fromStore.reportDataByQuery
            ),

          (params) =>
            record.lookup(
              cheapHash(queryConfig.query, { ...satisfiedByParentParams, ...params }),
              fromStore.reportDataByQuery
            )
        ),
      [fromStore.reportDataByQuery, parameterValues, queryConfig.query, satisfiedByParentParams]
    )

    const handleQueryFormSubmit = React.useCallback(
      (parameterValues: JSONRecord) => {
        const queryResultURI = cheapHash(queryConfig.query, {
          ...satisfiedByParentParams,
          ...parameterValues,
        })

        setQueryResultUri(some(queryResultURI))
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
      [dispatch.reports, queryConfig.query, satisfiedByParentParams]
    )

    React.useEffect(() => {
      if (
        !automaticQueryErrorState &&
        !fromStore.isExecutingQuery &&
        queryResultData.isNone() &&
        (!unsatisfiedByParentParams.length || withoutHeader)
      ) {
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
    }, [
      automaticQueryErrorState,
      dispatch,
      unsatisfiedByParentParams.length,
      queryResultData.isNone(),
      queryConfig.query,
      satisfiedByParentParams,
      fromStore.isExecutingQuery,
    ])

    const onChangeData = (oldData: JSONRecord, newData: JSONRecord) => {
      if (grid && grid.current) {
        const ds = grid.current.dataSource as []
        const idx = ds.findIndex((item) => matches(item)(oldData))
        if (idx && idx > -1) {
          // @ts-ignore
          ds[idx] = { ...newData }
          grid.current.refresh()
        }
      }
    }

    const getMemoizedDetailTemplate = React.useMemo(() => {
      return getDetailTemplate(
        dispatch,
        reportConfig.details,
        parameterValues.toUndefined(),
        parentData,
        onChangeData
      )
    }, [reportConfig.details, parameterValues.toUndefined(), parentData])

    const sortSettings: SortSettingsModel = {
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
      columns: sortBy("groupOrder", reportConfig.columns as any[]).reduce((acc, column) => {
        if (column.field && typeof column.groupOrder !== "undefined") {
          acc.push(column.field)
        }
        return acc
      }, [] as string[]),
    }

    const contextData = React.useMemo(
      () => ({ ...parentData, ...parameterValues.getOrElse(record.empty) }),
      [parentData, parameterValues.getOrElse(record.empty)]
    )

    /**
     * COMPONENT COLUMNS
     * Provide components to type "layout" columns
     */
    const columns: EnrichedColumnDefinition[] = React.useMemo(() => {
      const _columns = (reportConfig.columns as unknown) as ColumnConfig[]
      return _columns.map((columnConfig) => {
        if (columnConfig.type === "layout") {
          /*
           * Syncfusion grid does not type or document that "template"
           * accepts React components, so we up-cast as any type.
           */
          columnConfig.template = getDetailTemplate(
            dispatch,
            columnConfig.details,
            parameterValues.toUndefined(),
            parentData,
            onChangeData
          ) as any
        }
        return columnConfig
      })
    }, [reportConfig.columns, parameterValues.toUndefined(), parentData])

    return (
      <>
        {!isChildReport && (
          <Helmet>
            <title>{title || "Unknown Report"} | Reports | Channel Admin | OPG</title>
          </Helmet>
        )}
        {withoutHeader !== true &&
          (reportId.isSome() ||
            typeof title !== "undefined" ||
            !isEmpty(unsatisfiedByParentParams)) && (
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
          />
        </div>
      </>
    )
  }
)
