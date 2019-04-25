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

import visitorIdData from "../../../../../../mock-data/visitor-id-report.json"
import visitorIdDetailsData from "../../../../../../mock-data/visitor-id-report-details.json"
import { ClickEventArgs } from "@syncfusion/ej2-navigations"
import { Typography } from "antd"

interface DataSources {
  visitorId: typeof visitorIdData.results
  test: any[]
}

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

const dataSources: DataSources = {
  visitorId: visitorIdData.results,
  test: [],
}

interface Props {
  reportId: string
}

export type dataSourceTypes = keyof DataSources

const commonGridOptions = {
  detailDataBound: detailMapper(visitorIdDetailsData.results),
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

export function Report(props: WithRouteProps<Props>): JSX.Element {
  const reportId: dataSourceTypes = props.reportId as keyof DataSources
  const data: any[] = dataSources[reportId]
  const grid = useRef<GridComponent>(null)

  return (
    <div>
      <Typography.Title>{props.title}</Typography.Title>

      <GridComponent
        ref={grid}
        {...commonGridOptions}
        toolbarClick={handleToolbarItemClicked(grid)}
        childGrid={{ ...commonGridOptions, ...childGridOptions }}
        dataSource={data}
        columns={gridColumns}>
        <Inject
          services={[Toolbar, ColumnChooser, Resize, DetailRow, ExcelExport, PdfExport, Sort]}
        />
      </GridComponent>
    </div>
  )
}
