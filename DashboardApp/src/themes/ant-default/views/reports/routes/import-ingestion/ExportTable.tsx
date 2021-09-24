import React from "react"
import { Typography } from "antd"
import * as Table from "@opg/interface-builder-plugins/lib/syncfusion/table"
import { DEFAULT_PAGE_SIZE } from "./constants"
import "./import-ingestion.scss"
import { ExportStatus } from "./index"

/* *************************
 * INTERFACES
 */

interface ExportTableProps<T> {
  data: T[]
  title?: string
  onRowDataBind?: Table.StandardGridTypes.EmitType<Table.StandardGridTypes.RowDataBoundEventArgs> | undefined
}

interface RowCountColProps {
  rowcount: unknown
}

/* *************************
 * COMPONENTS
 */

function RowCountCol(props: RowCountColProps): JSX.Element {
  return <span>{typeof props.rowcount === "number" ? `${props.rowcount.toLocaleString()}` : "-"}</span>
}

export function ExportTable({ data, title, onRowDataBind }: ExportTableProps<ExportStatus>): JSX.Element {
  const pageSettings: Table.StandardGridTypes.PageSettingsModel = {
    pageSize: DEFAULT_PAGE_SIZE,
    pageSizes: false,
  }

  return (
    <>
      <Typography.Text strong={true} className={"table-title"}>
        {title}
      </Typography.Text>
      <Table.GridComponent
        dataSource={data}
        rowDataBound={onRowDataBind}
        allowPaging={data.length > DEFAULT_PAGE_SIZE}
        allowSelection={false}
        pageSettings={pageSettings}
        className="import-ingestion-table">
        <Table.ColumnsDirective>
          <Table.ColumnDirective field="partner" headerText="Partner" />
          <Table.ColumnDirective field="export_name" headerText="Export Name" />
          <Table.ColumnDirective field="export_date" headerText="Date" />
          <Table.ColumnDirective
            field="rowcount"
            headerText="Rows"
            template={RowCountCol}
            textAlign={"Right"}
            width={70}
          />
        </Table.ColumnsDirective>
        <Table.Inject services={[Table.PagerComponent]} />
      </Table.GridComponent>
    </>
  )
}

export default ExportTable
