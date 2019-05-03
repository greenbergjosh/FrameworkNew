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

interface Props {
  context: ReportContext
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

export function Report(props: WithRouteProps<Props>): JSX.Element {
  const reportId = props.context.id

  const [fromStore, dispatch] = useRematch((state) => ({
    configsById: store.select.globalConfig.configsById(state),
    decodedReportConfigsById: store.select.reports.decodedReportConfigByConfigId(state),
    decodedQueryConfigsById: store.select.reports.decodedQueryConfigByConfigId(state),
    reportDataByQuery: state.reports.reportDataByQuery,
    globalConfigPath: state.navigation.routes.dashboard.subroutes["global-config"].abs,
  }))

  const reportConfig = record.lookup(reportId, fromStore.decodedReportConfigsById)
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
          const data = parameterValues.chain((params) =>
            record.lookup(cheapHash(queryConfig.query, params), fromStore.reportDataByQuery)
          )
          return (
            <>
              <PageHeader
                extra={
                  <Button.Group size="small">
                    <Button>
                      <Reach.Link to={`${fromStore.globalConfigPath}/${reportId}`}>
                        View Config
                      </Reach.Link>
                    </Button>
                  </Button.Group>
                }
                title={`Report: ${props.title}`}>
                <QueryForm
                  layout={queryConfig.layout}
                  parameters={queryConfig.parameters}
                  parameterValues={parameterValues.getOrElse({})}
                  onSubmit={(parameterValues: JSONRecord) => {
                    console.log("report/index", "QueryForm.onSubmit", parameterValues)
                    setParameterValues(some(parameterValues))
                    dispatch.reports.executeQuery({
                      query: queryConfig.query,
                      params: parameterValues,
                    })
                  }}
                />
              </PageHeader>

              {/* <Button onClick={() => null}>Debug: Force Run Test Query</Button> */}
              <div style={{ width: "100%" }}>
                <GridComponent
                  ref={grid}
                  {...commonGridOptions}
                  toolbarClick={handleToolbarItemClicked(grid)}
                  // childGrid={{ ...commonGridOptions, ...childGridOptions }}
                  detailTemplate={() => (
                    // <table className="detailtable" style={{ width: "100%" }}>
                    //   <colgroup>
                    //     <col style={{ width: "35%" }} />
                    //     <col style={{ width: "35%" }} />
                    //     <col style={{ width: "30%" }} />
                    //   </colgroup>
                    //   <tbody>
                    //     <tr>
                    //       <td rowSpan={4} className="images">
                    //         Text
                    //       </td>
                    //       <td>
                    //         <span style={{ fontWeight: 500 }}>First Name: </span> Hello
                    //       </td>
                    //       <td>
                    //         <span style={{ fontWeight: 500 }}>Postal Code: </span> World
                    //       </td>
                    //     </tr>
                    //   </tbody>
                    // </table>
                    <div style={{ textAlign: "left" }}>Test ABCDE</div>
                  )}
                  dataSource={data.getOrElse([])}
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

export default Report
