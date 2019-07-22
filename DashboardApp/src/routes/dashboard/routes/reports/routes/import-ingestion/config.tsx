import { Icon, Typography } from "antd"
import { ColumnProps } from "antd/lib/table"
import moment from "moment"
import React from "react"
import { IngestionStatus } from "../../../../../../state/import-ingestion-report"
import * as record from "fp-ts/lib/Record"

export const PARTNER_QUERY_CONFIG_ID = "a3987b6c-3121-4a25-a781-60ff4c4eef25"
export const INGESTION_STATUS_QUERY_CONFIG_ID = "2327834e-9c0f-4d58-85f8-a774c1520984"

export const tableSettings = {
  bordered: false,
  loading: false,
  title: undefined,
  showHeader: true,
  scroll: undefined,
  hasData: true,
  pagination: { pageSize: 50 },
}

export const rawDataColumns = [
  {
    title: "File",
    dataIndex: "file_name",
    key: "file_name",
  },
  {
    title: "Time",
    dataIndex: "ts",
    render: (runtime: string) => (typeof runtime === "number" ? `${runtime}s` : "-"),
    key: "ts",
  },
  {
    title: "Rows",
    dataIndex: "rows_processed",
    key: "rows_processed",
  },
]

export const importIngestionColumns = [
  {
    title: "",
    dataIndex: "succeeded",
    key: "succeeded",
    render: (succeeded: boolean) => (
      <Icon type={succeeded ? "check-circle" : "exclamation-circle"} />
    ),
  },
  {
    title: "Table",
    dataIndex: "table_name",
    key: "table_name",
  },
  {
    title: "Time",
    dataIndex: "runtime",
    render: (runtime: string) => (typeof runtime === "number" ? `${runtime}s` : "-"),
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
