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
  dataBound,
} from "@syncfusion/ej2-react-grids"
import { Button, Select, Typography, PageHeader } from "antd"
import { Identity } from "fp-ts/lib/Identity"
import { identity } from "fp-ts/lib/function"
import { right } from "fp-ts/lib/Either"
import { none, Option, some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import React, { RefObject, Ref } from "react"
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
import { Errors } from "io-ts"

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
  report: GlobalConfigReference | LocalReportConfig
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
  parentData: JSONRecord
): { unsatisfiedByParentParams: ParameterItem[]; satisfiedByParentParams: JSONRecord } {
  return parameters.reduce<{
    unsatisfiedByParentParams: ParameterItem[]
    satisfiedByParentParams: JSONRecord
  }>(
    (acc, parameter) =>
      typeof parentData[parameter.name] !== "undefined"
        ? {
            ...acc,
            satisfiedByParentParams: {
              ...acc.satisfiedByParentParams,
              [parameter.name]: parentData[parameter.name],
            },
          }
        : {
            ...acc,
            unsatisfiedByParentParams: [...acc.unsatisfiedByParentParams, parameter],
          },
    { unsatisfiedByParentParams: [], satisfiedByParentParams: {} }
  )
}

function Report(props: ReportProps): JSX.Element {
  const [fromStore, dispatch] = useRematch((state) => ({
    decodedReportConfigsById: store.select.reports.decodedReportConfigByConfigId(state),
    decodedQueryConfigsById: store.select.reports.decodedQueryConfigByConfigId(state),
  }))

  const reportConfig =
    props.report.type === "GlobalConfigReference"
      ? record.lookup(props.report.id, fromStore.decodedReportConfigsById)
      : some(right<Errors, LocalReportConfig>(props.report))

  const reportId = props.report.type === "GlobalConfigReference" ? some(props.report.id) : none
  const queryConfig = new Identity(reportConfig)
    .map((a) => a.chain((b) => b.fold(Left((errs) => none), Right((rc) => rc.query))))
    .map((a) => a.chain((b) => record.lookup(b.id, fromStore.decodedQueryConfigsById)))
    .fold(identity)

  return (
    <div>
      <ReportOrErrors reportConfig={reportConfig} reportId={reportId} queryConfig={queryConfig}>
        {(reportConfig, queryConfig) => (
          <ReportBody
            parentData={props.data}
            queryConfig={queryConfig}
            reportConfig={reportConfig}
            reportId={reportId}
            title={props.title}
          />
        )}
      </ReportOrErrors>
    </div>
  )
}

export default ReportView

interface ReportBodyProps {
  parentData?: JSONRecord
  queryConfig: QueryConfig
  reportConfig: LocalReportConfig
  reportId: Option<string>
  title?: string
}

const ReportBody = ({
  parentData,
  queryConfig,
  reportConfig,
  reportId,
  title,
}: ReportBodyProps) => {
  const [fromStore, dispatch] = useRematch((state) => ({
    reportDataByQuery: state.reports.reportDataByQuery,
    globalConfigPath: state.navigation.routes.dashboard.subroutes["global-config"].abs,
  }))

  const grid = React.useRef<GridComponent>(null)

  const { satisfiedByParentParams, unsatisfiedByParentParams } = determineSatisfiedParameters(
    queryConfig.parameters,
    parentData || {}
  )

  const [queryResultUri, setQueryResultUri] = React.useState(none as Option<string>)
  const [parameterValues, setParameterValues] = React.useState(none as Option<JSONRecord>)

  console.log("Reporting", "Looking up query result data", {
    query: queryConfig.query,
    satisfiedByParentParams,
    parameterValues,
  })

  const queryResultData = parameterValues.foldL(
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
  )

  React.useEffect(() => {
    if (queryResultData.isNone() && !unsatisfiedByParentParams.length) {
      // Should we request data from the server?
      // console.log("All parameters are satisfied", {
      //   queryResultData,
      //   query: queryConfig.query,
      //   params: satisfiedByParentParams,
      // })

      dispatch.reports.executeQuery({
        resultURI: cheapHash(queryConfig.query, satisfiedByParentParams),
        query: queryConfig.query,
        params: satisfiedByParentParams,
      })
    }
  }, [
    dispatch,
    unsatisfiedByParentParams,
    queryResultData,
    queryConfig.query,
    satisfiedByParentParams,
  ])

  return (
    <>
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
          parameterValues={parameterValues.getOrElse({})}
          onSubmit={(parameterValues: JSONRecord) => {
            const queryResultURI = cheapHash(queryConfig.query, {
              ...satisfiedByParentParams,
              ...parameterValues,
            })

            setQueryResultUri(some(queryResultURI))
            setParameterValues(some(parameterValues))
            dispatch.reports.executeQuery({
              resultURI: queryResultURI,
              query: queryConfig.query,
              params: { ...satisfiedByParentParams, ...parameterValues },
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
                report={childReport}
                data={{ ...parameterValues.getOrElse({}), ...parentData }}
              />
            )
          )}
          dataSource={queryResultData.getOrElse([])}
          {...reportConfig.layout.componentProps}>
          <Inject
            services={[Toolbar, ColumnChooser, Resize, DetailRow, ExcelExport, PdfExport, Sort]}
          />
        </GridComponent>
      </div>
    </>
  )
}
