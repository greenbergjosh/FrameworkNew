import { ClickEventArgs } from "@syncfusion/ej2-navigations"
import {
  ColumnChooser,
  DetailDataBoundEventArgs,
  DetailRow,
  ExcelExport,
  GridComponent,
  GridModel,
  Inject,
  PdfExport,
  Resize,
  Sort,
  Toolbar,
} from "@syncfusion/ej2-react-grids"
import { Button, Select, Typography, PageHeader } from "antd"
import { Identity } from "fp-ts/lib/Identity"
import { identity } from "fp-ts/lib/function"
import { none, Option, some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import React, { RefObject } from "react"
import * as Reach from "@reach/router"
import { useRematch } from "../../../../../../hooks"
import { WithRouteProps } from "../../../../../../state/navigation"
import { store } from "../../../../../../state/store"
import { Left, Right } from "../../../../../../data/Either"
import { ReportOrErrors } from "./ReportOrErrors"
import { FormState, QueryForm } from "./QueryForm"
import { JSONRecord } from "../../../../../../data/JSON"
import { cheapHash } from "../../../../../../lib/json"
import {
  GlobalConfigReference,
  LocalReportConfig,
  ParameterItem,
  QueryConfig,
  RemoteReportConfig,
  ReportConfigCodec,
} from "../../../../../../data/Report"

const detailMapper = (childData: any[]) => ({
  // @ts-ignore
  childGrid,
  data: parentDataRecord,
}: DetailDataBoundEventArgs): void => {
  childGrid.dataSource = childData.map((childRecord) =>
    parentDataRecord && childGrid.queryString
      ? {
          // @ts-ignore
          [childGrid.queryString]: parentDataRecord[childGrid.queryString],
          ...childRecord,
        }
      : childRecord
  )
}

const handleToolbarItemClicked = (grid: RefObject<GridComponent>) => ({ item }: ClickEventArgs) => {
  if (item.id && item.id.endsWith("_excelexport")) {
    if (grid && grid.current) {
      grid.current.excelExport()
    }
  } else if (item.id && item.id.endsWith("_csvexport")) {
    if (grid && grid.current) {
      grid.current.csvExport()
    }
  } else if (item.id && item.id.endsWith("_pdfexport")) {
    if (grid && grid.current) {
      grid.current.pdfExport()
    }
  }
}

type ReportQueryId = string

interface ReportContext {
  id: ReportQueryId
}

interface ViewProps {
  context: ReportContext
}

interface ReportProps {
  report: GlobalConfigReference | RemoteReportConfig
  title?: string
  data?: JSONRecord
}

const commonGridOptions = {
  // detailDataBound: detailMapper([]),
  columnMenuItems: ["SortAscending", "SortDescending"],
  toolbar: ["CsvExport", "ExcelExport", "PdfExport", "Print", "ColumnChooser"],
  showColumnChooser: true,
  allowExcelExport: true,
  allowMultiSorting: true,
  allowPdfExport: true,
  allowResizing: true,
  allowReordering: true,
  allowSorting: true,
}

const gridColumns = [
  {
    field: "Date",
    type: "date",
    format: { type: "date", format: "yyyy-MM-dd" },
    width: "100",
  },
  {
    field: "VisitCount",
    width: "100",
  },
]

const childGridOptions: GridModel = {
  allowResizing: true,
  queryString: "Date",
  columns: [
    { field: "Domain", textAlign: "Right", width: 120 },
    { field: "Publisher", width: 80 },
    { field: "Slot", width: 50 },
    { field: "Page", width: 50 },
    { field: "MD5 Provider", width: 120 },
    { field: "MD5ProviderId", width: 150 },
    { field: "Selected", width: 50 },
    { field: "Responded", width: 50 },
    { field: "Succeeded", width: 50 },
  ],
}

const componentMap = {
  table: GridComponent,
  select: Select,
}

export function ReportView(props: WithRouteProps<ViewProps>): JSX.Element {
  return (
    <Report
      report={{
        type: "GlobalConfigReference",
        id: props.context.id,
      }}
      title={props.title}
    />
  )
}

function determineSatisfiedParameters(
  parameters: ParameterItem[],
  data: JSONRecord
): { unsatisfiedParameters: ParameterItem[]; satisfiedParameters: JSONRecord } {
  console.log("index.determineSatisfiedParameters", { parameters, data })
  return parameters.reduce(
    (acc, parameter) =>
      typeof data[parameter.name] !== "undefined"
        ? {
            ...acc,
            satisfiedParameters: {
              ...acc.satisfiedParameters,
              [parameter.name]: data[parameter.name],
            },
          }
        : {
            ...acc,
            unsatisfiedParameters: [...acc.unsatisfiedParameters, parameter],
          },
    { unsatisfiedParameters: [] as ParameterItem[], satisfiedParameters: {} as JSONRecord }
  )
}

function Report(props: ReportProps): JSX.Element {
  const [fromStore, dispatch] = useRematch((state) => ({
    configsById: store.select.globalConfig.configsById(state),
    decodedReportConfigsById: store.select.reports.decodedReportConfigByConfigId(state),
    decodedQueryConfigsById: store.select.reports.decodedQueryConfigByConfigId(state),
    reportDataByQuery: state.reports.reportDataByQuery,
    globalConfigPath: state.navigation.routes.dashboard.subroutes["global-config"].abs,
  }))

  const reportConfig =
    props.report.type === "GlobalConfigReference"
      ? record.lookup(props.report.id, fromStore.decodedReportConfigsById)
      : some(ReportConfigCodec.decode(props.report))

  const reportId = props.report.type === "GlobalConfigReference" ? props.report.id : void 0
  const queryConfig = new Identity(reportConfig)
    .map((a) => a.chain((b) => b.fold(Left((errs) => none), Right((rc) => rc.query))))
    .map((a) => a.chain((b) => record.lookup(b.id, fromStore.decodedQueryConfigsById)))
    .fold(identity)

  const grid = React.useRef<GridComponent>(null)
  const [parameterValues, setParameterValues] = React.useState(none as Option<JSONRecord>)

  // Force run query if report doesn't have parameters
  React.useEffect(() => {}, [dispatch.logger, dispatch.remoteDataClient])

  return (
    <div>
      <ReportOrErrors reportConfig={reportConfig} reportId={reportId} queryConfig={queryConfig}>
        {(reportConfig, queryConfig) => {
          const { satisfiedParameters, unsatisfiedParameters } = determineSatisfiedParameters(
            queryConfig.parameters,
            props.data || {}
          )

          console.log("Reporting", "Looking up query result data", {
            query: queryConfig.query,
            satisfiedParameters,
            parameterValues,
          })

          const queryResultData = parameterValues.foldL(
            () =>
              !unsatisfiedParameters.length
                ? record.lookup(
                    cheapHash(queryConfig.query, satisfiedParameters),
                    fromStore.reportDataByQuery
                  )
                : none,

            (params) =>
              record.lookup(
                cheapHash(queryConfig.query, { ...satisfiedParameters, ...params }),
                fromStore.reportDataByQuery
              )
          )

          queryResultData.foldL(() => {
            if (!unsatisfiedParameters.length && Object.keys(satisfiedParameters).length) {
              console.log("All parameters are satisfied", {
                queryResultData,
                query: queryConfig.query,
                params: satisfiedParameters,
              })

              dispatch.reports.executeQuery({
                query: queryConfig.query,
                params: satisfiedParameters,
              })
            }
          }, identity)

          return (
            <>
              <PageHeader
                extra={
                  reportId && (
                    <Button.Group size="small">
                      <Button>
                        <Reach.Link to={`${fromStore.globalConfigPath}/${reportId}`}>
                          View Config
                        </Reach.Link>
                      </Button>
                    </Button.Group>
                  )
                }
                title={props.title && `Report: ${props.title}`}>
                <QueryForm
                  layout={queryConfig.layout}
                  parameters={unsatisfiedParameters}
                  parameterValues={parameterValues.getOrElse({})}
                  onSubmit={(parameterValues: JSONRecord) => {
                    setParameterValues(some(parameterValues))
                    dispatch.reports.executeQuery({
                      query: queryConfig.query,
                      params: { ...satisfiedParameters, ...parameterValues },
                    })
                  }}
                />
              </PageHeader>

              <div style={{ width: "100%" }}>
                <GridComponent
                  ref={grid}
                  {...commonGridOptions}
                  toolbarClick={handleToolbarItemClicked(grid)}
                  detailTemplate={reportConfig.details.fold(
                    void 0,
                    (childReport) => (parentData: JSONRecord) => (
                      <Report
                        report={
                          childReport.type === "ReportConfig"
                            ? ReportConfigCodec.encode(childReport)
                            : childReport
                        }
                        data={{ ...parameterValues.getOrElse({}), ...parentData }}
                      />
                    )
                  )}
                  dataSource={queryResultData.getOrElse([])}
                  {...reportConfig.layout.componentProps}>
                  <Inject
                    services={[
                      Toolbar,
                      ColumnChooser,
                      Resize,
                      DetailRow,
                      ExcelExport,
                      PdfExport,
                      Sort,
                    ]}
                  />
                </GridComponent>
              </div>
            </>
          )
        }}
      </ReportOrErrors>
    </div>
  )
}

export default ReportView
