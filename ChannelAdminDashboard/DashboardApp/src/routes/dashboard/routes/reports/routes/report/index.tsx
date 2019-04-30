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
import { Button, Select, Typography } from "antd"
import { Do } from "fp-ts-contrib/lib/Do"
import { tryCatch2v } from "fp-ts/lib/Either"
import { identity } from "fp-ts/lib/function"
import { fromEither, option } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import React, { RefObject, useRef } from "react"
import { None, Some } from "../../../../../../data/Option"
import { QueryConfig, ReportConfig } from "../../../../../../data/Report"
import { useRematch } from "../../../../../../hooks"
import { WithRouteProps } from "../../../../../../state/navigation"
import { store } from "../../../../../../state/store"

const detailMapper = (childData: any[]) => ({
  // @ts-ignore
  childGrid,
  data,
}: DetailDataBoundEventArgs): void => {
  childGrid.dataSource = childData.map((childRecord) =>
    data && childGrid.queryString
      ? {
          // @ts-ignore
          [childGrid.queryString]: data[childGrid.queryString],
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
  detailDataBound: detailMapper([]),
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
  console.log("Report Child Page", props)
  const reportId = props.context.id

  const [fromStore, dispatch] = useRematch((state) => ({
    configsById: store.select.globalConfig.configsById(state),
  }))

  const reportConfig = record
    .lookup(reportId, fromStore.configsById)
    .chain(({ config }) => config)
    .map((configString) =>
      tryCatch2v(
        () => JSON.parse(configString) as ReportConfig, // TODO: Use io-ts
        (error) => console.log(error)
      )
    )
    .chain((e) => fromEither(e))

  const queryConfig = reportConfig
    .chain(({ query }) => record.lookup(query.id, fromStore.configsById))
    .chain(({ config }) => config)
    .map((configString) =>
      tryCatch2v(
        () => JSON.parse(configString) as QueryConfig, // TODO: Use io-ts
        (error) => console.log(error)
      )
    )
    .chain((e) => fromEither(e))

  const data: any[] = [] // <Query query={query} parameterValues={parameterValues}>
  // {({data, loading, error, refetch}) => {
  //
  //}}
  // Read from the store for Query + Parameters
  // If data is already cached, then use it
  // If no data is cached, query for it
  // If user presses query button, force re-fetch of data
  const grid = useRef<GridComponent>(null)

  const executeQuery = React.useCallback((query: string, parameters: unknown) => {}, [])

  React.useEffect(() => {}, [dispatch.logger, dispatch.remoteDataClient])

  return (
    <div>
      <Typography.Title>{props.title}</Typography.Title>

      {Do(option)
        .bind("report", reportConfig)
        .bind("query", queryConfig)
        .return(identity)
        .foldL(
          None(() => <Typography.Text type="danger">No Report Config Found</Typography.Text>),
          Some(({ report, query }) => {
            // query.query
            return (
              <>
                {/* <QueryForm parameters={query.parameters} /> */}
                <Button onClick={() => null}>Fire ze missiles</Button>
                <GridComponent
                  ref={grid}
                  {...commonGridOptions}
                  toolbarClick={handleToolbarItemClicked(grid)}
                  // childGrid={{ ...commonGridOptions, ...childGridOptions }}
                  dataSource={data}
                  {...report.layout.componentProps}>
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
              </>
            )
          })
        )}
    </div>
  )
}
