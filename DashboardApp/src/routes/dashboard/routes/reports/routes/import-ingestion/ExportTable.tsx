import React from "react"
import { Icon, Typography } from "antd"
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Inject,
  PagerComponent as Page,
  PageSettingsModel,
  RowDataBoundEventArgs,
} from "@syncfusion/ej2-react-grids"
import { EmitType } from "@syncfusion/ej2-base"
import { DEFAULT_PAGE_SIZE } from "./constants"
import "./import-ingestion.scss"
import { ExportStatus } from "./index"

/* *************************
 * INTERFACES
 */

interface ExportTableProps<T> {
  data: T[],
  title?: string,
  onRowDataBind?: EmitType<RowDataBoundEventArgs> | undefined,
}

interface RowCountColProps {
  rowcount: unknown
}

/* *************************
 * COMPONENTS
 */

function RowCountCol(props: RowCountColProps): JSX.Element {
  return (
    <span>
      {typeof props.rowcount === "number" ? `${props.rowcount.toLocaleString()}` : "-"}
    </span>
  )
}

export function ExportTable({ data, title, onRowDataBind }: ExportTableProps<ExportStatus>): JSX.Element {

  const pageSettings: PageSettingsModel = {
    pageSize: DEFAULT_PAGE_SIZE,
    pageSizes: false,
  }

  return (
    <>
      <Typography.Text strong={true} className={"table-title"}>{title}</Typography.Text>
      <GridComponent
        dataSource={data}
        rowDataBound={onRowDataBind}
        allowPaging={data.length > DEFAULT_PAGE_SIZE}
        allowSelection={false}
        pageSettings={pageSettings}
        className="import-ingestion-table"
      >
        <ColumnsDirective>
          <ColumnDirective
            field="partner"
            headerText="Partner"
          />
          <ColumnDirective
            field="export_name"
            headerText="Export Name"
          />
          <ColumnDirective
            field="export_date"
            headerText="Date"
          />
          <ColumnDirective
            field="rowcount"
            headerText="Rows"
            template={RowCountCol}
            textAlign={"Right"}
            width={70}
          />
        </ColumnsDirective>
        <Inject services={[Page]}/>
      </GridComponent>
    </>
  )
}

export default ExportTable
