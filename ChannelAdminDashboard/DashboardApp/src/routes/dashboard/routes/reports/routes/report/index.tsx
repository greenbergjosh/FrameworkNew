import * as Reach from "@reach/router"
import { ClickEventArgs } from "@syncfusion/ej2-navigations"
import { Button, PageHeader } from "antd"
import { empty as emptyArray, isEmpty } from "fp-ts/lib/Array"
import { right } from "fp-ts/lib/Either"
import { identity } from "fp-ts/lib/function"
import { Identity } from "fp-ts/lib/Identity"
import { none, Option, some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { Errors } from "io-ts"
import React from "react"
import { Helmet } from "react-helmet"
import { Left, Right } from "../../../../../../data/Either"
import { JSONRecord } from "../../../../../../data/JSON"
import { useRematch } from "../../../../../../hooks"
import { cheapHash } from "../../../../../../lib/json"
import { WithRouteProps } from "../../../../../../state/navigation"
import { store } from "../../../../../../state/store"
import { QueryForm } from "./QueryForm"
import { ReportOrErrors } from "./ReportOrErrors"
import {
  Aggregate,
  ColumnChooser,
  DetailDataBoundEventArgs,
  DetailRow,
  ExcelExport,
  Freeze,
  GridComponent,
  GridModel,
  Inject,
  PdfExport,
  Resize,
  Sort,
  Toolbar,
} from "@syncfusion/ej2-react-grids"
import {
  GlobalConfigReference,
  LocalReportConfig,
  ParameterItem,
  QueryConfig,
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

const handleToolbarItemClicked = (grid: React.RefObject<GridComponent>) => ({
  item,
}: ClickEventArgs) => {
  if (item.id && item.id.endsWith("_excelexport")) {
    if (grid.current) {
      grid.current.excelExport()
    }
  } else if (item.id && item.id.endsWith("_csvexport")) {
    if (grid.current) {
      grid.current.csvExport()
    }
  } else if (item.id && item.id.endsWith("_pdfexport")) {
    if (grid.current) {
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

export function ReportView(props: WithRouteProps<ViewProps>): JSX.Element {
  return (
    <>
      <Helmet>
        <title>{props.title || "Unknown Report"} | Channel Admin | OPG</title>
      </Helmet>

      <Report
        report={{
          type: "GlobalConfigReference",
          id: props.context.id,
        }}
        title={props.title}
      />
    </>
  )
}

function determineSatisfiedParameters(
  parameters: ParameterItem[],
  parentData: JSONRecord
): { unsatisfiedByParentParams: ParameterItem[]; satisfiedByParentParams: JSONRecord } {
  return parameters.reduce<ReturnType<typeof determineSatisfiedParameters>>(
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

  const reportConfig = React.useMemo(
    () =>
      props.report.type === "GlobalConfigReference"
        ? record.lookup(props.report.id, fromStore.decodedReportConfigsById)
        : some(right<Errors, LocalReportConfig>(props.report)),
    [fromStore.decodedReportConfigsById, props.report]
  )

  const reportId = React.useMemo(
    () => (props.report.type === "GlobalConfigReference" ? some(props.report.id) : none),
    [props.report]
  )

  const queryConfig = React.useMemo(
    () =>
      new Identity(reportConfig)
        .map((a) => a.chain((b) => b.fold(Left((errs) => none), Right((rc) => rc.query))))
        .map((a) => a.chain((b) => record.lookup(b.id, fromStore.decodedQueryConfigsById)))
        .fold(identity),
    [fromStore.decodedQueryConfigsById, reportConfig]
  )

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

const ReportBody = React.memo(
  ({ parentData, queryConfig, reportConfig, reportId, title }: ReportBodyProps) => {
    const [fromStore, dispatch] = useRematch((state) => ({
      reportDataByQuery: state.reports.reportDataByQuery,
      globalConfigPath: state.navigation.routes.dashboard.subroutes["global-config"].abs,
      isExecutingQuery: state.loading.effects.reports.executeQuery,
    }))

    const grid = React.useRef<GridComponent>(null)

    const { satisfiedByParentParams, unsatisfiedByParentParams } = React.useMemo(
      () => determineSatisfiedParameters(queryConfig.parameters, parentData || {}),
      [parentData, queryConfig.parameters]
    )

    const [queryResultUri, setQueryResultUri] = React.useState(none as Option<string>)
    const [parameterValues, setParameterValues] = React.useState(none as Option<JSONRecord>)

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
        dispatch.reports.executeQuery({
          resultURI: queryResultURI,
          query: queryConfig.query,
          params: { ...satisfiedByParentParams, ...flattenObject(parameterValues) },
        })
      },
      [dispatch.reports, queryConfig.query, satisfiedByParentParams]
    )

    const handleToolbarClick = React.useMemo(() => handleToolbarItemClicked(grid), [])

    React.useEffect(() => {
      if (
        !fromStore.isExecutingQuery &&
        queryResultData.isNone() &&
        !unsatisfiedByParentParams.length
      ) {
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
      fromStore.isExecutingQuery,
    ])

    const createDetailTemplate = React.useMemo(
      () =>
        reportConfig.details
          .map((childReport) => (parentData: JSONRecord) => (
            <Report
              report={childReport}
              data={{
                ...flattenObject(parameterValues.getOrElse(record.empty)),
                ...flattenObject(parentData),
              }}
            />
          ))
          .toUndefined(),
      [parameterValues, reportConfig.details]
    )

    return (
      <>
        {(reportId.isSome() || title !== undefined || !isEmpty(unsatisfiedByParentParams)) && (
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
          <PureGridComponent
            ref={grid}
            {...commonGridOptions}
            toolbarClick={handleToolbarClick}
            detailTemplate={createDetailTemplate}
            dataSource={queryResultData.getOrElse(emptyArray)}
            {...reportConfig.layout.componentProps}>
            <Inject services={gridComponentServices} />
          </PureGridComponent>
        </div>
      </>
    )
  }
)

const PureGridComponent = React.memo(GridComponent)

const gridComponentServices = [
  Toolbar,
  ColumnChooser,
  Resize,
  DetailRow,
  ExcelExport,
  PdfExport,
  Sort,
  Freeze,
  Aggregate,
]

const flattenObject = (obj: any) => {
  const flattened: any = {}

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object" && obj[key] !== null && obj[key]["_unrollValue"] === true) {
      Object.assign(flattened, obj[key].data)
    } else {
      flattened[key] = obj[key]
    }
  })

  return flattened
}
