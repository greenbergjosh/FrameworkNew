import moment from 'moment';
import { Typography } from "antd"
import React from "react"


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
    title: 'Partners',
    dataIndex: 'partner',
    key: 'partner',
  },
];

export const rawDataColumns = [
  {
    title: 'File',
    dataIndex: 'file_name',
    key: 'file_name',
  },
  {
    title: 'Time',
    dataIndex: 'ts',
    render: (ts:string) => moment(ts).format('MM/DD/YY h:mm:ss A'),
    key: 'ts',
  },
  {
    title: 'Rows',
    dataIndex: 'rows_processed',
    key: 'rows_processed',
  },
];

export const importExportDataColumns = [
  {
    title: 'Table',
    dataIndex: 'table_name',
    key: 'table_name',
  },
  {
    title: 'Time',
    dataIndex: 'ts',
    render: (ts:string) => moment(ts).format('MM/DD/YY h:mm:ss A'),
    key: 'ts',
  },
  {
    title: 'Rows',
    dataIndex: 'rows_processed',
    key: 'rows_processed',
  },
];