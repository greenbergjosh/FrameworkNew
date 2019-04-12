import React, { useRef } from "react"
import { WithRouteProps } from "../../../../../../state/navigation"
import {
  ColumnChooser,
  ColumnDirective,
  ColumnsDirective,
  DetailDataBoundEventArgs,
  DetailRow,
  ExcelExport,
  GridComponent,
  GridModel,
  Inject,
  Toolbar,
} from "@syncfusion/ej2-react-grids"

import visitorIdData from "../../../../../../mock-data/visitor-id-report.json"
import visitorIdDetailsData from "../../../../../../mock-data/visitor-id-report-details.json"
import { ClickEventArgs } from "@syncfusion/ej2-navigations"

interface DataSources {
  visitorId: typeof visitorIdData.results
  test: any[]
}

const dataSources: DataSources = {
  visitorId: visitorIdData.results,
  test: [],
}

interface Props {
  reportId: string
}

export type dataSourceTypes = keyof DataSources

const toolbarOptions = ["CsvExport", "ExcelExport", "ColumnChooser"]
const childGridOptions: GridModel = {
  queryString: "Date",
  columns: [
    { field: "Domain", textAlign: "Right", width: 150 },
    { field: "Publisher", width: 100 },
    { field: "Slot", width: 100 },
    { field: "Page", width: 100 },
  ],
}

export function Report(props: WithRouteProps<Props>): JSX.Element {
  const reportId: dataSourceTypes = props.reportId as keyof DataSources
  const data: any[] = dataSources[reportId]
  const grid = useRef<GridComponent>(null)

  // console.log(
  //   "index.Report",
  //   `dataSources['${props.reportId}']`,
  //   data,
  //   props,
  //   childGridOptions.dataSource
  // )
  //
  const handleToolbarItemClicked = ({ item }: ClickEventArgs) => {
    if (item.id && item.id.endsWith("_excelexport")) {
      if (grid && grid.current) {
        grid.current.excelExport()
      }
    } else if (item.id && item.id.endsWith("_csvexport")) {
      if (grid && grid.current) {
        grid.current.csvExport()
      }
    }
  }

  return (
    <div>
      {props.title}
      <GridComponent
        ref={grid}
        dataSource={data}
        detailDataBound={function(args: DetailDataBoundEventArgs) {
          // console.log("Reports.detailDataBound", args)
          // @ts-ignore
          args.childGrid.dataSource = visitorIdDetailsData.results.map((result) => ({
            ...result,
            ...args.data,
          }))
        }}
        childGrid={childGridOptions}
        toolbar={toolbarOptions}
        toolbarClick={handleToolbarItemClicked}
        showColumnChooser
        allowExcelExport>
        <ColumnsDirective>
          <ColumnDirective
            field="Date"
            type="date"
            format={{ type: "date", format: "yyyy-MM-dd" }}
            width="100"
          />
          <ColumnDirective field="VisitCount" width="100" />
        </ColumnsDirective>
        <Inject services={[Toolbar, ColumnChooser, DetailRow, ExcelExport]} />
      </GridComponent>
    </div>
  )
}
