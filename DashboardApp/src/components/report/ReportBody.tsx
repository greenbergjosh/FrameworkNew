import { StandardGrid, UserInterface, UserInterfaceContext } from "@opg/interface-builder"
import * as Reach from "@reach/router"
import { Button, PageHeader } from "antd"
import { empty as emptyArray, isEmpty } from "fp-ts/lib/Array"
import { none, Option, some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { sortBy } from "lodash/fp"
import React from "react"
import { Helmet } from "react-helmet"
import { AdminUserInterfaceContextManagerProvider } from "../../data/AdminUserInterfaceContextManager"
import { AdminUserInterfaceContextManager } from "../../data/AdminUserInterfaceContextManager.type"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { JSONRecord } from "../../data/JSON"
import { useRematch } from "../../hooks"
import { determineSatisfiedParameters } from "../../lib/determine-satisfied-parameters"
import { cheapHash } from "../../lib/json"
import { store } from "../../state/store"
import { QueryForm } from "./QueryForm"
import { Report } from "./Report"
import {
  ColumnModel,
  GridComponent,
  SortDescriptorModel,
  GroupSettingsModel,
  SortSettingsModel,
  PageSettingsModel,
} from "@syncfusion/ej2-react-grids"
import {
  DataMappingItem,
  GlobalConfigReference,
  LocalReportConfig,
  QueryConfig,
  ReportDetails,
  SimpleLayoutConfig,
} from "../../data/Report"

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

    const createDetailTemplate = React.useMemo(() => {
      return reportDetailsToComponent(
        reportConfig.details,
        parameterValues.toUndefined(),
        parentData
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

    // React.useEffect(() => {
    //   console.log("ReportBody.construct", { reportConfig, queryConfig })
    //   return () => {
    //     console.log("ReportBody.destroy", { reportConfig, queryConfig })
    //   }
    // })

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
            columns={reportConfig.columns as ColumnModel[]}
            contextData={contextData}
            data={queryResultData.getOrElse(emptyArray)}
            detailTemplate={createDetailTemplate}
            loading={fromStore.isExecutingQuery}
            sortSettings={sortSettings}
            groupSettings={groupSettings}
            pageSettings={pageSettings}
            defaultCollapseAll={reportConfig.defaultCollapseAll}
          />
        </div>
      </>
    )
  }
)

const reportDetailsToComponent = (
  details: string | ReportDetails | LocalReportConfig,
  parameterValues?: JSONRecord,
  parentData?: JSONRecord
) => {
  const resolved = resolveDetails(details)

  if (resolved) {
    const dataResolver =
      typeof details === "object" &&
      (details.type === "report" || details.type === "layout" || details.type === "ReportConfig") &&
      !!details.dataMapping
        ? performDataMapping.bind(null, details.dataMapping)
        : (rowData: JSONRecord) => ({ ...(parentData || record.empty), ...rowData })

    if (resolved.type === "GlobalConfigReference" || resolved.type === "ReportConfig") {
      return (rowData: JSONRecord) => (
        <Report
          isChildReport
          report={resolved}
          data={dataResolver({
            ...(parentData || record.empty),
            ...(parameterValues || record.empty),
            ...rowData,
          })}
          withoutHeader
        />
      )
    } else if (resolved.type === "SimpleLayoutConfig") {
      return (rowData: JSONRecord) => (
        <AdminUserInterfaceContextManagerProvider>
          {(userInterfaceContextManager) => (
            <UserInterface
              mode="display"
              contextManager={userInterfaceContextManager}
              components={resolved.layout}
              data={dataResolver({
                ...(parentData || record.empty),
                ...(parameterValues || record.empty),
                ...rowData,
              })}
            />
          )}
        </AdminUserInterfaceContextManagerProvider>
      )
    }
  }

  return null
}

const resolveDetails = (
  details: string | ReportDetails | LocalReportConfig | SimpleLayoutConfig
): GlobalConfigReference | LocalReportConfig | SimpleLayoutConfig | null => {
  if (!details) {
    return null
  } else if (typeof details === "string") {
    return { type: "GlobalConfigReference", id: details } as GlobalConfigReference
  } else if (details.type === "report") {
    if (details.reportType === "config") {
      return { type: "GlobalConfigReference", id: details.report } as GlobalConfigReference
    } else if (details.reportType === "inline") {
      return {
        type: "ReportConfig",
        columns: details.data.columns,
        details: resolveDetails(details.data.details),
        dataMapping: details.dataMapping,
        query: details.data.query,
      } as LocalReportConfig
    }
  } else if (details.type === "layout") {
    return { type: "SimpleLayoutConfig", layout: details.layout } as SimpleLayoutConfig
  } else if (details.type === "ReportConfig" || details.type === "SimpleLayoutConfig") {
    return details
  }

  return null
}

const performDataMapping = (dataMapping: DataMappingItem[], data: JSONRecord) => {
  if (dataMapping) {
    return dataMapping.reduce(
      (acc, { originalKey, mappedKey }) => ({ ...acc, [mappedKey]: acc[originalKey] }),
      data
    )
  } else {
    return data
  }
}