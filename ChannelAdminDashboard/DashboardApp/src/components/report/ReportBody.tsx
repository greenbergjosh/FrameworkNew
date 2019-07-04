import * as Reach from "@reach/router"
import { ClickEventArgs } from "@syncfusion/ej2-navigations"
import { Button, PageHeader } from "antd"
import { empty as emptyArray, isEmpty } from "fp-ts/lib/Array"
import { none, Option, some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import React from "react"
import { JSONRecord } from "../../data/JSON"
import { useRematch } from "../../hooks"
import { cheapHash } from "../../lib/json"
import { UserInterface } from "../interface-builder/UserInterface"
import { QueryForm } from "./QueryForm"
import { Report } from "./Report"
import {
  GlobalConfigReference,
  LocalReportConfig,
  ParameterItem,
  QueryConfig,
  RemoteReportConfig,
  ReportDetails,
  ReportDetailsAsReport,
  ReportDetailsAsLayout,
  LayoutItem,
  SimpleLayoutConfig,
} from "../../data/Report"
import {
  Aggregate,
  ColumnChooser,
  DetailDataBoundEventArgs,
  DetailRow,
  ExcelExport,
  FilterSettingsModel,
  Freeze,
  GridComponent,
  GridModel,
  Inject,
  PdfExport,
  Resize,
  Sort,
  Toolbar,
  Filter,
} from "@syncfusion/ej2-react-grids"

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
  allowFiltering: true,
}

// const gridColumns = [
//   {
//     field: "Date",
//     type: "date",
//     format: { type: "date", format: "yyyy-MM-dd" },
//     width: "100",
//   },
//   {
//     field: "VisitCount",
//     width: "100",
//   },
// ]

// const childGridOptions: GridModel = {
//   allowResizing: true,
//   queryString: "Date",
//   columns: [
//     { field: "Domain", textAlign: "Right", width: 120 },
//     { field: "Publisher", width: 80 },
//     { field: "Slot", width: 50 },
//     { field: "Page", width: 50 },
//     { field: "MD5 Provider", width: 120 },
//     { field: "MD5ProviderId", width: 150 },
//     { field: "Selected", width: 50 },
//     { field: "Responded", width: 50 },
//     { field: "Succeeded", width: 50 },
//   ],
// }

const filterSettings: FilterSettingsModel = {
  type: "Menu",
}

export interface ReportBodyProps {
  parentData?: JSONRecord
  queryConfig: QueryConfig
  reportConfig: LocalReportConfig
  reportId: Option<string>
  title?: string
}

export const ReportBody = React.memo(
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
      unsatisfiedByParentParams.length,
      queryResultData.isNone(),
      queryConfig.query,
      satisfiedByParentParams,
      fromStore.isExecutingQuery,
    ])

    const createDetailTemplate = React.useMemo(
      () => reportDetailsToComponent(reportConfig.details, parameterValues.toUndefined()),
      [parameterValues, reportConfig.details]
    )

    return (
      <>
        {(reportId.isSome() ||
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
          <PureGridComponent
            ref={grid}
            {...commonGridOptions}
            filterSettings={filterSettings}
            toolbarClick={handleToolbarClick}
            detailTemplate={createDetailTemplate}
            dataSource={queryResultData.getOrElse(emptyArray)}
            columns={reportConfig.columns}>
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
  Filter,
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

const reportDetailsToComponent = (
  details: string | ReportDetails | LocalReportConfig,
  parameterValues?: JSONRecord
) => {
  const resolved = resolveDetails(details)
  console.log("ReportBody.reportDetailsToComponent", { details, resolved })
  if (resolved) {
    if (resolved.type === "GlobalConfigReference" || resolved.type === "ReportConfig") {
      return (parentData: JSONRecord) => (
        <Report
          report={resolved}
          data={{
            ...flattenObject(parameterValues || record.empty),
            ...flattenObject(parentData),
          }}
        />
      )
    } else if (resolved.type === "SimpleLayoutConfig") {
      return (parentData: JSONRecord) => (
        <UserInterface
          mode="display"
          components={resolved.layout}
          data={{
            ...flattenObject(parameterValues || record.empty),
            ...flattenObject(parentData),
          }}
        />
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
