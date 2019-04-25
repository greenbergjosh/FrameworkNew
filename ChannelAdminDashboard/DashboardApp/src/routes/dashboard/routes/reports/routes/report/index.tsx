import React, { RefObject, useRef } from "react"
import { WithRouteProps } from "../../../../../../state/navigation"
import {
  ColumnChooser,
  DetailDataBoundEventArgs,
  DetailRow,
  ExcelExport,
  GridComponent,
  GridModel,
  Inject,
  PdfExport,
  Toolbar,
  Resize,
  Sort,
} from "@syncfusion/ej2-react-grids"

import { ClickEventArgs } from "@syncfusion/ej2-navigations"
import { Typography } from "antd"
import { useRematch } from "../../../../../../hooks"
import { store } from "../../../../../../state/store"
import { fromEither } from "fp-ts/lib/Option"
import { tryCatch2v } from "fp-ts/lib/Either"
import * as record from "fp-ts/lib/Record"
import { Some, None } from "../../../../../../data/Option"

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

type ReportQueryId = string

interface LayoutDetailsItem {
  query: ReportQueryId
}

interface LayoutItem {
  component: string
  componentProps: Record<string, unknown>
  details: LayoutDetailsItem
}

interface ReportConfig {
  query: ReportQueryId
  layout: LayoutItem
}

export function Report(props: WithRouteProps<Props>): JSX.Element {
  console.log("Report Child Page", props)
  const reportId = props.context.id

  const [fromStore] = useRematch((state) => ({
    configsById: store.select.globalConfig.configsById(state),
  }))

  const reportGlobalConfig = record.lookup(reportId, fromStore.configsById)
  const reportConfig = reportGlobalConfig
    .chain(({ config }) => config)
    .map((configString) =>
      tryCatch2v(
        () => {
          return JSON.parse(configString) as ReportConfig // TODO: Use IO
        },
        (error) => {
          console.log(error)
        }
      )
    )
    .chain((e) => fromEither(e))

  const data: any[] = []
  const grid = useRef<GridComponent>(null)

  return (
    <div>
      <Typography.Title>{props.title}</Typography.Title>

      {reportConfig.foldL(
        None(() => <Typography.Text type="danger">No Report Config Found</Typography.Text>),
        Some((r) => (
          <GridComponent
            ref={grid}
            {...commonGridOptions}
            toolbarClick={handleToolbarItemClicked(grid)}
            // childGrid={{ ...commonGridOptions, ...childGridOptions }}
            dataSource={data}
            {...r.layout.componentProps}>
            <Inject
              services={[Toolbar, ColumnChooser, Resize, DetailRow, ExcelExport, PdfExport, Sort]}
            />
          </GridComponent>
        ))
      )}
    </div>
  )
}
