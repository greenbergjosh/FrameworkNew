import React from "react"
import { Icon, Typography } from "antd"
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Inject,
  Page,
  PageSettingsModel,
  RowDataBoundEventArgs,
} from "@syncfusion/ej2-react-grids"
import { EmitType } from "@syncfusion/ej2-base"
import { DEFAULT_PAGE_SIZE } from "./constants"
import "./import-ingestion.scss"
import { IngestionStatus } from "./index"

/* *************************
 * INTERFACES
 */

interface ExportTableProps<T> {
  data: T[],
  title?: string,
  onRowDataBind?: EmitType<RowDataBoundEventArgs> | undefined,
}

interface SucceededColProps {
  succeeded: boolean
}

interface RuntimeColProps {
  runtime: unknown
}

interface RowsProcessedColProps {
  rows_processed: unknown
}

/* *************************
 * COMPONENTS
 */

function SucceededCol(props: SucceededColProps): JSX.Element {
  return (
    <Icon
      type={props.succeeded ? "check-circle" : "exclamation-circle"}
      theme="twoTone"
      twoToneColor={props.succeeded ? "#52c41a" : "red"}
    />
  )
}

function RuntimeCol(props: RuntimeColProps): JSX.Element {
  return (
    <span>
      {typeof props.runtime === "number" ? `${props.runtime}s` : "-"}
    </span>
  )
}

function RowsProcessedCol(props: RowsProcessedColProps): JSX.Element {
  return (
    <span>
      {typeof props.rows_processed === "number" ? `${props.rows_processed.toLocaleString()}` : "-"}
    </span>
  )
}

export function ImportIngestionTable({ data, title, onRowDataBind }: ExportTableProps<IngestionStatus>): JSX.Element {

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
            field="succeeded"
            headerText=""
            template={SucceededCol}
            width={30}
          />
          <ColumnDirective
            field="table_name"
            headerText="Table"
          />
          <ColumnDirective
            field="runtime"
            headerText="Time"
            template={RuntimeCol}
            textAlign={"Right"}
            width={70}
          />
          <ColumnDirective
            field="rows_processed"
            headerText="Rows"
            template={RowsProcessedCol}
            textAlign={"Right"}
            width={70}
          />
        </ColumnsDirective>
        <Inject services={[Page]}/>
      </GridComponent>
    </>
  )
}

export default ImportIngestionTable
