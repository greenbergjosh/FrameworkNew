import { Icon, Typography } from "antd"
import { ColumnProps } from "antd/lib/table"
import moment from "moment"
import React from "react"
import { IngestionStatus } from "../../../../../../state/import-ingestion-report"

export const tableSettings = {
  bordered: false,
  loading: false,
  title: undefined,
  showHeader: true,
  scroll: undefined,
  hasData: true,
}

export const partnerColumns = [
  {
    title: "Partners",
    dataIndex: "partner",
    key: "partner",
  },
]

export const rawDataColumns = [
  {
    title: "File",
    dataIndex: "file_name",
    key: "file_name",
  },
  {
    title: "Time",
    dataIndex: "ts",
    render: (ts: string) => moment(ts).format("MM/DD/YY h:mm:ss A"),
    key: "ts",
  },
  {
    title: "Rows",
    dataIndex: "rows_processed",
    key: "rows_processed",
  },
]

export const importExportDataColumns = [
  {
    title: "",
    dataIndex: "succeeded",
    key: "succeeded",
    render: (succeeded: boolean) => (
      <Icon type={succeeded ? "check-circle" : "eclamation-circle"} />
    ),
  },
  {
    title: "Table",
    dataIndex: "table_name",
    key: "table_name",
  },
  // {
  //   title: 'Time',
  //   dataIndex: 'ts',
  //   render: (ts:string) => moment(ts).format('MM/DD/YY h:mm:ss A'),
  //   key: 'ts',
  // },
  {
    title: "Time",
    dataIndex: "runtime",
    render: (runtime: string) => `${runtime}s`,
    key: "runtime",
    align: "right",
  },
  {
    title: "Rows",
    dataIndex: "rows_processed",
    key: "rows_processed",
    align: "right",
  },
] as ColumnProps<IngestionStatus>[]
